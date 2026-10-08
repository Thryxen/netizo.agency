/**
 * Generuje wizytówki do druku z szablon.html i danych z osoby.json: dla każdej osoby PDF 91 × 61 mm (85 × 55 + 3 mm
 * spadu, strona 1 przód, strona 2 tył, wektorowo z osadzonymi fontami, z TrimBox i BleedBox dla drukarni) do pdf/ oraz
 * podglądy PNG przyciętych kart do podglad/. Kod QR na przodzie zapisuje kontakt (vCard) w telefonie.
 *
 * Pola osoby: name, role, phone, email. Wizytówka firmowa: "company": true (role niepotrzebne, w vCard kontakt jest
 * firmą), a w polu po lewej zamiast imienia i stanowiska stoją "heading" i "subheading". Opcjonalne "slug" nadaje nazwę
 * plików (domyślnie z name).
 *
 * Uruchomienie (z katalogu projektu, bez instalowania niczego w projekcie):
 *   npx -y -p playwright@1.58.0 -p qrcode@1.5.4 -p pdf-lib@1.17.1 node netizo/wizytowki/generuj.cjs
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
const PT_PER_MM = 72 / 25.4;
const RUN_COMMAND = 'npx -y -p playwright@1.58.0 -p qrcode@1.5.4 -p pdf-lib@1.17.1 node netizo/wizytowki/generuj.cjs';

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

/**
 * Uruchamiane w stronie: wypełnia każde [data-pattern] sygnetami N z <template id="sygnet">, w siatce co data-pitch mm
 * (środki na jej węzłach liczonych od linii cięcia), znaki wysokości data-size mm. data-fade="x0 y0 x1 y1" (mm od cięcia)
 * wygasza wzór: od punktu (x0, y0), gdzie go nie ma, do (x1, y1), gdzie ma pełny kolor --pattern. Pośrednie tony to
 * pełne kolory zmieszane z --paper, nie przezroczystość, żeby PDF do druku jej nie zawierał.
 */
function drawPattern({ bleed, card }) {
    const source = document.querySelector('#sygnet').content.firstElementChild;
    const [, , viewWidth, viewHeight] = source.getAttribute('viewBox').split(/\s+/).map(Number);
    const smoothstep = (t) => {
        const clamped = Math.min(1, Math.max(0, t));

        return clamped * clamped * (3 - 2 * clamped);
    };

    for (const layer of document.querySelectorAll('[data-pattern]')) {
        const pitch = parseFloat(layer.dataset.pitch);
        const height = parseFloat(layer.dataset.size);
        const width = (height * viewWidth) / viewHeight;
        const fade = layer.dataset.fade?.split(/\s+/).map(Number);
        const strength = (x, y) => {
            if (!fade) {
                return 1;
            }

            const [fromX, fromY, toX, toY] = fade;
            const dx = toX - fromX;
            const dy = toY - fromY;

            return smoothstep(((x - fromX) * dx + (y - fromY) * dy) / (dx * dx + dy * dy));
        };
        const firstNode = (extent) => -Math.floor((bleed + extent / 2) / pitch) * pitch;

        layer.replaceChildren();

        for (let y = firstNode(height); y - height / 2 < card.height + bleed; y += pitch) {
            for (let x = firstNode(width); x - width / 2 < card.width + bleed; x += pitch) {
                const tone = strength(x, y);

                if (tone < 0.06) {
                    continue;
                }

                const mark = document.createElement('div');

                mark.className = 'pattern__mark svg-fit';
                mark.style.left = `${bleed + x - width / 2}mm`;
                mark.style.top = `${bleed + y - height / 2}mm`;
                mark.style.height = `${height}mm`;
                mark.style.color = `color-mix(in srgb, var(--pattern) ${(tone * 100).toFixed(1)}%, var(--paper))`;
                mark.append(source.cloneNode(true));
                layer.append(mark);
            }
        }
    }
}

/**
 * Chromium zaokrągla stronę PDF w górę do siatki 1/300 cala (91 × 61 mm → 258 × 173,04 pt), a treść przycina do
 * dokładnego rozmiaru z @page, przyklejoną do lewego górnego rogu. Przy prawej i dolnej krawędzi zostawał przez to
 * niezadrukowany pasek ułamka punktu, widoczny jako biała linia na ciemnym tyle. Przycinamy MediaBox do treści
 * (91 × 61 mm; wysokość treści Chromium zaokrągla do 1/64 px, więc bywa o tysięczne części milimetra mniejsza) i dodajemy
 * TrimBox (linia cięcia, 85 × 55 mm, liczona od lewego górnego rogu jak w szablonie) oraz BleedBox (spad).
 */
async function fitPageBoxes(PDFDocument, pdf) {
    const document = await PDFDocument.load(pdf, { updateMetadata: false });
    const contentPt = (mm) => Math.min(mm * PT_PER_MM, (Math.round(mm * PX_PER_MM * 64) / 64) * 0.75);
    const bleed = BLEED_MM * PT_PER_MM;
    const width = contentPt(CARD_MM.width + 2 * BLEED_MM);
    const height = contentPt(CARD_MM.height + 2 * BLEED_MM);
    const trim = { width: CARD_MM.width * PT_PER_MM, height: CARD_MM.height * PT_PER_MM };

    for (const page of document.getPages()) {
        const top = page.getMediaBox().height;

        page.setMediaBox(0, top - height, width, height);
        page.setBleedBox(0, top - height, width, height);
        page.setTrimBox(bleed, top - bleed - trim.height, trim.width, trim.height);
    }

    return document.save({ useObjectStreams: false });
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
    const { PDFDocument } = loadModule('pdf-lib');

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
        await page.evaluate(drawPattern, { bleed: BLEED_MM, card: CARD_MM });

        const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });

        fs.writeFileSync(path.join(DIR, 'pdf', `${slug}.pdf`), await fitPageBoxes(PDFDocument, pdf));

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
