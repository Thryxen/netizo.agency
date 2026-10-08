/**
 * Generuje obraz do podglądów linków (og:image, twitter:image): public/assets/images/og-netizo-2.png, 1200 × 630 px, z
 * szablon.html. Logo, sygnet i fonty są wspólne z wizytówkami (netizo/wizytowki), więc marka zmienia się w jednym miejscu.
 *
 * Uruchomienie (z katalogu projektu, bez instalowania niczego w projekcie):
 *   npx -y -p playwright@1.58.0 node netizo/og-image/generuj.cjs
 * Gdy brakuje przeglądarki: npx -y playwright@1.58.0 install chromium
 *
 * Po zmianie nazwy pliku zaktualizuj HomeController, config/seotools.php i tests/Feature/HomePageTest.php. Nowa nazwa
 * omija pamięć podręczną podglądów (Facebook, Discord, Cloudflare), która trzyma stary obraz pod starym adresem.
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SHARED = path.join(DIR, '..', 'wizytowki');
const OUTPUT = path.join(DIR, '..', '..', 'public', 'assets', 'images', 'og-netizo-2.png');
const SIZE = { width: 1200, height: 630 };
/** WhatsApp pomija podgląd z obrazem większym niż 300 KB. */
const MAX_BYTES = 300 * 1024;
const RUN_COMMAND = 'npx -y -p playwright@1.58.0 node netizo/og-image/generuj.cjs';

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

(async () => {
    const { chromium } = loadModule('playwright');
    const html = render(inlineFonts(fs.readFileSync(path.join(DIR, 'szablon.html'), 'utf8')), {
        logo: fs.readFileSync(path.join(SHARED, 'logo.svg'), 'utf8'),
        sygnet: fs.readFileSync(path.join(SHARED, 'sygnet.svg'), 'utf8'),
    });

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: SIZE, deviceScaleFactor: 1 });

    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: OUTPUT, type: 'png', clip: { x: 0, y: 0, ...SIZE } });
    await browser.close();

    const bytes = fs.statSync(OUTPUT).size;

    if (bytes >= MAX_BYTES) {
        throw new Error(`Obraz ma ${Math.round(bytes / 1024)} KB, a podglądy w WhatsApp wymagają mniej niż 300 KB.`);
    }

    console.log(`✓ ${path.relative(process.cwd(), OUTPUT)} (${SIZE.width} × ${SIZE.height}, ${Math.round(bytes / 1024)} KB)`);
})().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
