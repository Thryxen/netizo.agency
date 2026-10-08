/**
 * Generuje wizytówki do druku z szablon.html i danych z osoby.json: dla każdej osoby PDF 91 × 61 mm (85 × 55 + 3 mm
 * spadu, strona 1 przód, strona 2 tył, wektorowo z osadzonymi fontami) do pdf/ oraz podglądy PNG przyciętych kart do
 * podglad/. Kod QR na przodzie zapisuje kontakt (vCard) w telefonie.
 *
 * Pola osoby: name, role, phone, email. Wizytówka firmowa: "company": true (role niepotrzebne, w vCard kontakt jest
 * firmą), a w polu po lewej zamiast imienia i stanowiska stoją "heading" i "subheading". Opcjonalne "slug" nadaje nazwę
 * plików (domyślnie z name).
 *
 * Uruchomienie (z katalogu projektu, bez instalowania niczego w projekcie):
 *   npx -y -p playwright@1.58.0 -p qrcode@1.5.4 node netizo/wizytowki/generuj.cjs
 * Gdy brakuje przeglądarki: npx -y playwright@1.58.0 install chromium
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const BLEED_MM = 3;
const CARD_MM = { width: 85, height: 55 };
const PX_PER_MM = 96 / 25.4;
/** Podgląd w ~600 dpi. */
const PREVIEW_SCALE = 6;
const RUN_COMMAND = 'npx -y -p playwright@1.58.0 -p qrcode@1.5.4 node netizo/wizytowki/generuj.cjs';

/** Pakiety z `npx -p` nie są widoczne dla require(), więc szukamy ich też w katalogach .bin z PATH. */
function loadModule(name) {
    const candidates = [name];

    for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
        if (dir.endsWith(path.join('node_modules', '.bin'))) {
            candidates.push(path.join(dir, '..', name));
        }
    }

    for (const candidate of candidates) {
        try {
            return require(candidate);
        } catch {
            // Następny kandydat.
        }
    }

    console.error(`Nie znaleziono pakietu "${name}". Uruchom: ${RUN_COMMAND}`);
    process.exit(1);
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

/** Wartość vCard: przecinki, średniki i ukośniki poprzedzone ukośnikiem. */
const escapeVcard = (value) => String(value).replace(/[\\,;]/g, (char) => `\\${char}`);

const slugify = (value) =>
    value
        .replace(/ł/g, 'l')
        .replace(/Ł/g, 'L')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

function vcard(person) {
    const parts = person.name.trim().split(/\s+/);
    const lastName = parts.length > 1 ? parts.pop() : '';
    const firstName = parts.join(' ');

    return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVcard(lastName)};${escapeVcard(firstName)};;;`,
        `FN:${escapeVcard(person.name)}`,
        'ORG:Netizo',
        ...(person.role ? [`TITLE:${escapeVcard(person.role)}`] : []),
        ...(person.company ? ['X-ABShowAs:COMPANY'] : []),
        `TEL:${person.phone.replace(/[^\d+]/g, '')}`,
        `EMAIL:${person.email}`,
        'URL:https://netizo.pl',
        'END:VCARD',
    ].join('\r\n');
}

/**
 * Kod QR (korekcja L: karta jest czysta, a mniejsza korekcja daje większe moduły, łatwiejsze do zeskanowania z druku)
 * jako SVG z wypełnionych prostokątów (jeden na każdy poziomy ciąg modułów). SVG z biblioteki rysuje moduły
 * liniami z crispEdges, co po przeskalowaniu zostawia jasne szczeliny między rzędami i psuje skanowanie.
 */
function qrSvg(QRCode, text) {
    const { modules } = QRCode.create(text, { errorCorrectionLevel: 'L' });
    const { size, data } = modules;
    let d = '';

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!data[y * size + x]) {
                continue;
            }

            let run = 1;

            while (x + run < size && data[y * size + x + run]) {
                run++;
            }

            d += `M${x} ${y}h${run}v1h-${run}z`;
            x += run - 1;
        }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><path fill="#0a0a0a" d="${d}"/></svg>`;
}

/** Fonty jako data URI, bo strona jest ładowana przez setContent (bez adresu, względem którego działałoby fonts/). */
function inlineFonts(html) {
    return html.replace(/url\('fonts\/([^']+)'\)/g, (match, file) => {
        const data = fs.readFileSync(path.join(DIR, 'fonts', file)).toString('base64');

        return `url('data:font/ttf;base64,${data}')`;
    });
}

function render(template, values) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        if (!(key in values)) {
            throw new Error(`Nieznany znacznik w szablonie: ${match}`);
        }

        return values[key];
    });
}

/**
 * Uruchamiane w stronie po załadowaniu fontów: zmniejsza tekst z [data-fit], aż zmieści się w swoim pudełku. Jedna
 * linia: do 60% rozmiaru. data-fit="wrap": najpierw do 80% w jednej linii, potem od 85% w najwyżej dwóch (do 50%).
 */
function fitText() {
    for (const element of document.querySelectorAll('[data-fit]')) {
        element.style.removeProperty('font-size');
        element.style.removeProperty('white-space');

        const wraps = element.dataset.fit === 'wrap';
        const base = parseFloat(getComputedStyle(element).fontSize);
        const overflows = () => element.scrollWidth > element.clientWidth + 0.5;
        const lines = () => Math.round(element.scrollHeight / parseFloat(getComputedStyle(element).lineHeight));
        const shrinkWhile = (tooBig, min) => {
            let size = parseFloat(element.style.fontSize) || base;

            while (tooBig() && size > min) {
                size -= 0.2;
                element.style.fontSize = `${size}px`;
            }
        };

        shrinkWhile(overflows, base * (wraps ? 0.8 : 0.6));

        if (wraps && overflows()) {
            element.style.whiteSpace = 'normal';
            element.style.fontSize = `${base * 0.85}px`;
            shrinkWhile(() => overflows() || lines() > 2, base * 0.5);
        }
    }
}

(async () => {
    const people = JSON.parse(fs.readFileSync(path.join(DIR, 'osoby.json'), 'utf8'));

    for (const [index, person] of people.entries()) {
        for (const field of person.company ? ['name', 'phone', 'email'] : ['name', 'role', 'phone', 'email']) {
            if (!person[field]) {
                throw new Error(`osoby.json, pozycja ${index + 1}: brak pola "${field}".`);
            }
        }
    }

    const QRCode = loadModule('qrcode');
    const { chromium } = loadModule('playwright');

    const template = inlineFonts(fs.readFileSync(path.join(DIR, 'szablon.html'), 'utf8'));
    const shared = {
        logo: fs.readFileSync(path.join(DIR, 'logo.svg'), 'utf8'),
        sygnet: fs.readFileSync(path.join(DIR, 'sygnet.svg'), 'utf8'),
    };

    fs.mkdirSync(path.join(DIR, 'pdf'), { recursive: true });
    fs.mkdirSync(path.join(DIR, 'podglad'), { recursive: true });

    const browser = await chromium.launch();
    const page = await browser.newPage({ deviceScaleFactor: PREVIEW_SCALE });

    for (const person of people) {
        const slug = person.slug ?? slugify(person.name);
        const html = render(template, {
            ...shared,
            qr: qrSvg(QRCode, vcard(person)),
            personClass: person.company ? ' person--company' : '',
            name: escapeHtml(person.heading ?? person.name),
            role: escapeHtml(person.subheading ?? person.role ?? ''),
            phone: escapeHtml(person.phone),
            email: escapeHtml(person.email),
        });

        await page.setContent(html, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(fitText);

        await page.pdf({ path: path.join(DIR, 'pdf', `${slug}.pdf`), preferCSSPageSize: true, printBackground: true });

        const cards = await page.$$('.card');

        for (const [card, side] of [
            [cards[0], 'przod'],
            [cards[1], 'tyl'],
        ]) {
            const box = await card.boundingBox();

            await page.screenshot({
                path: path.join(DIR, 'podglad', `${slug}-${side}.png`),
                clip: {
                    x: box.x + BLEED_MM * PX_PER_MM,
                    y: box.y + BLEED_MM * PX_PER_MM,
                    width: CARD_MM.width * PX_PER_MM,
                    height: CARD_MM.height * PX_PER_MM,
                },
            });
        }

        console.log(`✓ ${person.name}: pdf/${slug}.pdf, podglad/${slug}-przod.png, podglad/${slug}-tyl.png`);
    }

    await browser.close();
})().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
