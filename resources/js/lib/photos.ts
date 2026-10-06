/**
 * The generated photo series (spec v2 §3) in public/assets/images/photos: each photo ships at its native width
 * (`{name}.webp`) and as a 768w variant (`{name}-768.webp`). Sizes are the generated sizes.
 *
 * `lqip`: the photo averaged down to 8 columns (lossless WebP data URI, ~370 B), only for the above-the-fold photo.
 * PixelatedImage paints it, pixelated, from the first paint, so the hero opens on its mosaic instead of a blank frame.
 * Regenerate it whenever the photo changes (e.g. sharp: resize(8, 12, { fit: 'fill' }).webp({ lossless: true })).
 */
const PHOTOS = {
    'hero-studio': {
        width: 1024,
        height: 1536,
        lqip: 'data:image/webp;base64,UklGRmgBAABXRUJQVlA4TFsBAAAvB8ACAPfiMJJkVTn/rjixkH9GzkkariPJVpXj8h7uRMAvqZB/Au6u13EjSYrUvEw/vrPhzn+rlrF3/mPtZZGICJsHKSqIvwlhlnbpGwHgl/4N5kHTtMoqT+ohMtH8VP1iRgruQj2khqggJgclBvogJlg7ISR/ER/ErZsEsYo5LJoDC6hAUZos5da9T94Ff98tjy8mExeBgIZGTBQk3xRiSED44vRA3zT8cI1okJZE/EL1cP+nazPTmgJThMwA0M9UjRx3fxgd2zXGUH7A3oqpBuyfIn09Fj/LNKTLzn22mkqqbT+eXKovgqb7rB1TphN27G/s9XedI2he4DAAAKLVlG27rdm2bZsR/Y9swutMpru9FfcbveF2YxbyZT1VKxmV4lf5NOuX/qCqitTpGtVi7yeK3c9sOhLIdvBrdcNOxl2u1qPcSyBn4/kiKcFQ+//gGRoBuOPhFiJwEAA=',
    },
    'bento-mobile': { width: 1024, height: 1536 },
    'bento-ecommerce': { width: 1536, height: 1024 },
    'mission-workshop': { width: 1536, height: 1024 },
    'process-discovery': { width: 1536, height: 1024 },
    'process-design': { width: 1536, height: 1024 },
    'process-development': { width: 1536, height: 1024 },
    'process-launch': { width: 1536, height: 1024 },
    'contact-desk': { width: 1024, height: 1024 },
} as const satisfies Record<string, { width: number; height: number; lqip?: string }>;

export type PhotoName = keyof typeof PHOTOS;

export type PhotoSources = {
    src: string;
    srcSet: string;
    width: number;
    height: number;
    lqip?: string;
    /** Marks a photo (not a project screenshot) for the dark-theme photo balance in app.css. */
    'data-photo': '';
};

/**
 * `src`, `srcSet` (768w + native), intrinsic size and (above the fold) `lqip` for a photo; add `sizes` per use.
 *
 * @example <PixelatedImage {...photo('mission-workshop')} sizes="(min-width: 1024px) 680px, 100vw" alt="" className="aspect-[3/2]" />
 */
export function photo(name: PhotoName): PhotoSources {
    const entry: { width: number; height: number; lqip?: string } = PHOTOS[name];
    const base = `/assets/images/photos/${name}`;

    return {
        src: `${base}.webp`,
        srcSet: `${base}-768.webp 768w, ${base}.webp ${entry.width}w`,
        width: entry.width,
        height: entry.height,
        lqip: entry.lqip,
        'data-photo': '',
    };
}
