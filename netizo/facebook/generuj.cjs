/**
 * Generuje grafiki fanpage'a netizo na Facebooku z szablon.html, w jasnym i ciemnym motywie strony:
 *   okladka-{jasna,ciemna}.png  1640 × 720 px (zdjęcie w tle)
 *   avatar-{jasny,ciemny}.png   1080 × 1080 px (zdjęcie profilowe)
 * Sygnet i fonty są wspólne z wizytówkami (netizo/wizytowki), więc marka zmienia się w jednym miejscu.
 *
 * Uruchomienie (z katalogu projektu, bez instalowania niczego w projekcie):
 *   npx -y -p playwright@1.58.0 node netizo/facebook/generuj.cjs
 * Gdy brakuje przeglądarki: npx -y playwright@1.58.0 install chromium
 *
 * Wgrywaj PNG, nie JPG: Facebook i tak kompresuje obraz, a z PNG tekst i linie zostają ostre.
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SHARED = path.join(DIR, '..', 'wizytowki');
const RUN_COMMAND = 'npx -y -p playwright@1.58.0 node netizo/facebook/generuj.cjs';

/** Grafiki z szablonu ([data-export]) i motywy (data-theme na body), każda w osobnym pliku w tym katalogu. */
const EXPORTS = [
    { name: 'okladka', files: { light: 'okladka-jasna.png', dark: 'okladka-ciemna.png' } },
    { name: 'avatar', files: { light: 'avatar-jasny.png', dark: 'avatar-ciemny.png' } },
];

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

/** Fonty jako data URI, bo strona jest ładowana przez setContent (bez adresu, względem którego działałoby fonts/). */
function inlineFonts(html) {
    return html.replace(/url\('fonts\/([^']+)'\)/g, (match, file) => {
        const data = fs.readFileSync(path.join(SHARED, 'fonts', file)).toString('base64');

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
 * Uruchamiane w stronie: wypełnia każde [data-pattern] sygnetami N z <template id="sygnet">, w siatce co data-pitch px
 * wyśrodkowanej na grafice, znaki wysokości data-size px. data-fade="x0 y0 x1 y1" (px) wygasza wzór: od punktu
 * (x0, y0), gdzie go nie ma, do (x1, y1), gdzie ma pełny kolor --pattern. Pośrednie tony to pełne kolory zmieszane
 * z --paper, jak na wizytówkach (patrz drawPattern w netizo/wizytowki/generuj.cjs), więc działają w obu motywach.
 */
function drawPattern() {
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
        const [fromX, fromY, toX, toY] = layer.dataset.fade.split(/\s+/).map(Number);
        const dx = toX - fromX;
        const dy = toY - fromY;
        const strength = (x, y) => smoothstep(((x - fromX) * dx + (y - fromY) * dy) / (dx * dx + dy * dy));
        const nodes = (extent) => {
            const centre = extent / 2;
            const first = centre - Math.ceil(centre / pitch) * pitch;

            return Array.from({ length: Math.floor((extent - first) / pitch) + 1 }, (_, index) => first + index * pitch);
        };

        layer.replaceChildren();

        for (const y of nodes(layer.clientHeight)) {
            for (const x of nodes(layer.clientWidth)) {
                const tone = strength(x, y);

                if (tone < 0.06) {
                    continue;
                }

                const mark = document.createElement('div');

                mark.className = 'pattern__mark svg-fit';
                mark.style.left = `${x - width / 2}px`;
                mark.style.top = `${y - height / 2}px`;
                mark.style.height = `${height}px`;
                mark.style.color = `color-mix(in srgb, var(--pattern) ${(tone * 100).toFixed(1)}%, var(--paper))`;
                mark.append(source.cloneNode(true));
                layer.append(mark);
            }
        }
    }
}

(async () => {
    const { chromium } = loadModule('playwright');
    const html = render(inlineFonts(fs.readFileSync(path.join(DIR, 'szablon.html'), 'utf8')), {
        sygnet: fs.readFileSync(path.join(SHARED, 'sygnet.svg'), 'utf8'),
    });

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1640, height: 1080 }, deviceScaleFactor: 1 });

    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(drawPattern);

    for (const { name, files } of EXPORTS) {
        const element = page.locator(`[data-export="${name}"]`);
        const { width, height } = await element.boundingBox();

        for (const [theme, file] of Object.entries(files)) {
            const output = path.join(DIR, file);

            await page.evaluate((value) => (document.body.dataset.theme = value), theme);
            await element.screenshot({ path: output, type: 'png' });

            console.log(`✓ ${path.relative(process.cwd(), output)} (${width} × ${height}, ${Math.round(fs.statSync(output).size / 1024)} KB)`);
        }
    }

    await browser.close();
})().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
