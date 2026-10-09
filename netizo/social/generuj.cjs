/**
 * Generuje grafiki do postów netizo z szablon.html, w jasnym motywie strony, do tego katalogu:
 *   fb-tworzenie-stron.png, fb-koszty-i-seo.png  1080 × 1080 px (Facebook)
 *   ig-tworzenie-stron.png, ig-koszty-i-seo.png  1080 × 1350 px (Instagram)
 * Logo i fonty są wspólne z wizytówkami (netizo/wizytowki), a zdjęcia to seria ze strony (public/assets/images/photos),
 * więc marka zmienia się w jednym miejscu.
 *
 * Uruchomienie (z katalogu projektu, bez instalowania niczego w projekcie):
 *   npx -y -p playwright@1.58.0 node netizo/social/generuj.cjs
 * Tylko wybrane grafiki: dopisz nazwy plików, np. `… generuj.cjs ig-koszty-i-seo.png`.
 * Gdy brakuje przeglądarki: npx -y playwright@1.58.0 install chromium
 *
 * Wgrywaj PNG, nie JPG: Facebook i Instagram i tak kompresują obraz, a z PNG tekst i linie zostają ostre.
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SHARED = path.join(DIR, '..', 'wizytowki');
const PHOTOS = path.join(DIR, '..', '..', 'public', 'assets', 'images', 'photos');
const RUN_COMMAND = 'npx -y -p playwright@1.58.0 node netizo/social/generuj.cjs';

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

/**
 * Fonty (url('fonts/…')) i zdjęcia (src="photos/…") jako data URI, bo strona jest ładowana przez setContent (bez
 * adresu, względem którego działałyby ścieżki względne).
 */
function inlineAssets(html) {
    const dataUri = (file, type) => `data:${type};base64,${fs.readFileSync(file).toString('base64')}`;

    return html
        .replace(/url\('fonts\/([^']+)'\)/g, (match, file) => `url('${dataUri(path.join(SHARED, 'fonts', file), 'font/ttf')}')`)
        .replace(/src="photos\/([^"]+)"/g, (match, file) => `src="${dataUri(path.join(PHOTOS, file), 'image/webp')}"`);
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
 * Uruchamiane w stronie: wstawia do każdej grafiki ([data-post]) post z <template> o id z data-post i nad nim ramę
 * z <template id="frame"> (linie i nity leżą na krawędzi zdjęcia), rysuje pierścienie karty wydajności ([data-ticks]:
 * 24 kreski co 15°, jak ScoreCard na stronie) i czeka, aż zdjęcia będą gotowe.
 */
function placePosts() {
    const frame = document.querySelector('#frame').content;

    for (const canvas of document.querySelectorAll('[data-post]')) {
        const post = document.querySelector(`#${canvas.dataset.post}`).content;

        canvas.replaceChildren(post.cloneNode(true), frame.cloneNode(true));
    }

    for (const ring of document.querySelectorAll('[data-ticks]')) {
        ring.innerHTML = Array.from({ length: 24 }, (_, tick) => `<rect x="27" y="1" width="2" height="6" transform="rotate(${tick * 15} 28 28)"/>`).join('');
    }

    return Promise.all(Array.from(document.images, (image) => image.decode()));
}

(async () => {
    const { chromium } = loadModule('playwright');
    const html = render(inlineAssets(fs.readFileSync(path.join(DIR, 'szablon.html'), 'utf8')), {
        logo: fs.readFileSync(path.join(SHARED, 'logo.svg'), 'utf8'),
    });

    const browser = await chromium.launch();

    try {
        const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });

        await page.setContent(html, { waitUntil: 'load' });
        await page.evaluate(placePosts);
        await page.evaluate(() => document.fonts.ready);
        // Okno na całą stronę: grafika spoza okna wychodzi na zrzucie pusta.
        await page.setViewportSize({ width: 1080, height: await page.evaluate(() => document.body.scrollHeight) });

        const names = await page.locator('[data-export]').evaluateAll((elements) => elements.map((element) => element.dataset.export));
        const requested = process.argv.slice(2);
        const unknown = requested.filter((file) => !names.some((name) => `${name}.png` === file));

        if (unknown.length > 0) {
            throw new Error(`Nieznana grafika: ${unknown.join(', ')}. Dostępne: ${names.map((name) => `${name}.png`).join(', ')}.`);
        }

        for (const name of names.filter((candidate) => requested.length === 0 || requested.includes(`${candidate}.png`))) {
            const element = page.locator(`[data-export="${name}"]`);
            const { width, height } = await element.boundingBox();
            const output = path.join(DIR, `${name}.png`);

            await element.screenshot({ path: output, type: 'png' });

            console.log(`✓ ${path.relative(process.cwd(), output)} (${width} × ${height}, ${Math.round(fs.statSync(output).size / 1024)} KB)`);
        }
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
