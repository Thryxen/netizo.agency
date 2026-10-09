/**
 * The generated photo series (spec v2 §3, v3 §3) in public/assets/images/photos: each photo ships at its native width
 * (`{name}.webp`) and as a 768w variant (`{name}-768.webp`). Sizes are the generated sizes.
 *
 * `shop-*`: the knitwear shop the hero's LiveBuild stage builds (shop-hero 3:2, the products 1:1).
 * `backdrop-*`: the sets the live mock-ups float on (spec v7, 3:2, colour at the edges, a calm defocused centre):
 * the knitwear workshop behind the hero's LiveBuild, the office corner behind the client panel.
 * `world-wool` (3:2): the knitwear shop's wool, under the FAQ chat.
 * `newsletter-reading`: the Newsletter photo (4:5).
 * `partner-referral` (3:2): a business card handed across a café table, under the partner programme's hero scene;
 * the right half is a calm sage wall for the floating chips.
 */
const PHOTOS = {
    'bento-mobile': { width: 1024, height: 1536 },
    'bento-ecommerce': { width: 1536, height: 1024 },
    'mission-workshop': { width: 1536, height: 1024 },
    'contact-desk': { width: 1024, height: 1024 },
    'shop-hero': { width: 1536, height: 1024 },
    'shop-sweater': { width: 1024, height: 1024 },
    'shop-scarf': { width: 1024, height: 1024 },
    'shop-hat': { width: 1024, height: 1024 },
    'backdrop-workshop': { width: 1536, height: 1024 },
    'backdrop-office': { width: 1536, height: 1024 },
    'world-wool': { width: 1536, height: 1024 },
    'newsletter-reading': { width: 1024, height: 1280 },
    'partner-referral': { width: 1536, height: 1024 },
} as const satisfies Record<string, { width: number; height: number }>;

export type PhotoName = keyof typeof PHOTOS;

export type PhotoSources = {
    src: string;
    srcSet: string;
    width: number;
    height: number;
    /** Marks a photo (not a project screenshot) for the dark-theme photo balance in app.css. */
    'data-photo': '';
};

/**
 * `src`, `srcSet` (768w + native) and intrinsic size for a photo; add `sizes` per use.
 *
 * @example <Photo {...photo('mission-workshop')} sizes="(min-width: 1024px) 680px, 100vw" alt="" className="aspect-[3/2]" />
 */
export function photo(name: PhotoName): PhotoSources {
    const entry = PHOTOS[name];
    const base = `/assets/images/photos/${name}`;

    return {
        src: `${base}.webp`,
        srcSet: `${base}-768.webp 768w, ${base}.webp ${entry.width}w`,
        width: entry.width,
        height: entry.height,
        'data-photo': '',
    };
}
