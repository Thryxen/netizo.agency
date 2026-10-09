import { useScroll, useTransform } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Photo } from '@/components/home/photo';
import { ThemedImage } from '@/components/home/themed-image';
import { useMotionStyle, useReducedMotionPreference } from '@/components/motion';
import { localized, useCopy } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/home';

const PLACEHOLDER_LIGHT = '/assets/images/illustrations/project-placeholder-light.webp';
const PLACEHOLDER_DARK = '/assets/images/illustrations/project-placeholder-dark.webp';

const COPY = localized({
    pl: {
        alt: (title: string): string => `Zrzut ekranu strony ${title}`,
        scrollable: (alt: string): string => `${alt} (przewijany)`,
        scrollHint: 'Przewiń zrzut, aby zobaczyć całą stronę.',
    },
    en: {
        alt: (title: string): string => `Screenshot of the ${title} website`,
        scrollable: (alt: string): string => `${alt} (scrollable)`,
        scrollHint: 'Scroll the screenshot to see the whole page.',
    },
});

/** How far (px) the screenshot drifts up inside its window while the frame passes through the viewport. */
const PARALLAX_DISTANCE = 24;

type ProjectFrameProps = {
    project: Project;
    /**
     * preview: a 16:10 window onto the full-page screenshot (`fullImageUrl ?? thumbnailUrl`), top-aligned. It drifts
     * slightly with the page (parallax) and slowly scrolls the whole page while the frame is hovered, or while a
     * control inside the surrounding `group/project` has keyboard focus.
     * full: the whole `fullImageUrl ?? thumbnailUrl` in a viewport that scrolls when the screenshot is taller.
     */
    variant?: 'preview' | 'full';
    className?: string;
};

/**
 * Browser-window chrome around a project screenshot: three dots, an address bar with the
 * project URL and the image. Falls back to the placeholder illustration when there is no screenshot.
 * Screenshots always load lazily: the projects sit well below the fold, so they must not compete with
 * the fonts and scripts the first screen needs.
 */
export function ProjectFrame({ project, variant = 'preview', className }: ProjectFrameProps) {
    const copy = useCopy(COPY);
    const imageUrl = project.fullImageUrl ?? project.thumbnailUrl;
    const alt = copy.alt(project.title);

    return (
        <div data-slot="project-frame" className={cn('group/frame overflow-hidden rounded-lg border bg-background', className)}>
            <div className="flex h-10 items-center gap-3 border-b bg-muted/60 px-3.5">
                <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-foreground/20" />
                    <span className="size-1.5 rounded-full bg-foreground/20" />
                    <span className="size-1.5 rounded-full bg-foreground/20" />
                </span>
                <span className="flex h-6 max-w-md min-w-0 flex-1 items-center rounded-md border bg-background px-2.5 font-mono text-xs text-muted-foreground">
                    <span className="truncate">{project.url}</span>
                </span>
            </div>

            {imageUrl === null ? (
                <div className="aspect-[16/10] bg-background">
                    <ThemedImage
                        light={PLACEHOLDER_LIGHT}
                        dark={PLACEHOLDER_DARK}
                        alt=""
                        width={1536}
                        height={1024}
                        className="block size-full object-cover"
                    />
                </div>
            ) : variant === 'full' ? (
                <ScrollableScreenshot src={imageUrl} alt={alt} />
            ) : (
                <ScreenshotPreview src={imageUrl} alt={alt} />
            )}
        </div>
    );
}

/**
 * The preview window. Layers, outside in:
 * - the 16:10 window (clips),
 * - a parallax layer, PARALLAX_DISTANCE taller than the window, moved up by scroll progress (0 → −24px),
 * - the Photo wrapper filling that layer; it is a size container, so the <img> (the whole page at the window's
 *   width, never shorter than the layer) can translate by exactly its overflow: −(100% − 100cqh).
 *
 * The slow scroll only runs with motion allowed (`motion-safe`). It scrolls down in 6 s linear and returns faster.
 */
function ScreenshotPreview({ src, alt }: { src: string; alt: string }) {
    const windowRef = useRef<HTMLDivElement>(null);
    const layerRef = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotionPreference();
    const { scrollYProgress } = useScroll({ target: windowRef, offset: ['start end', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -PARALLAX_DISTANCE]);

    useMotionStyle(layerRef, { y });

    return (
        <div ref={windowRef} className="relative aspect-[16/10] overflow-hidden bg-muted">
            <div ref={layerRef} className="absolute inset-x-0 top-0 h-[calc(100%+24px)]">
                <Photo
                    src={src}
                    alt={alt}
                    width={1600}
                    height={1000}
                    className="size-full [container-type:size]"
                    imgClassName={cn(
                        'h-auto! min-h-full object-top',
                        'transition-transform duration-[900ms] ease-expo-out',
                        'motion-safe:group-hover/frame:translate-y-[calc(-100%+100cqh)] motion-safe:group-hover/frame:duration-[6s] motion-safe:group-hover/frame:ease-linear',
                        'motion-safe:group-has-focus-visible/project:translate-y-[calc(-100%+100cqh)] motion-safe:group-has-focus-visible/project:duration-[6s] motion-safe:group-has-focus-visible/project:ease-linear',
                    )}
                />
            </div>
        </div>
    );
}

const CAPPED_VIEWPORT_QUERY = '(min-width: 768px)';

/**
 * Full-page screenshots are often several screens tall. From md up they sit in a capped viewport that
 * scrolls; when it actually overflows, the viewport becomes a focusable, labelled region so keyboard users
 * can scroll it. On phones the image renders uncapped, so swiping scrolls the dialog instead of trapping
 * the gesture in a nested scroll box.
 */
function ScrollableScreenshot({ src, alt }: { src: string; alt: string }) {
    const copy = useCopy(COPY);
    const viewportRef = useRef<HTMLDivElement>(null);
    const [isScrollable, setIsScrollable] = useState(false);

    const measure = useCallback((): void => {
        const viewport = viewportRef.current;

        if (!viewport) {
            return;
        }

        const isCapped = typeof window.matchMedia !== 'function' || window.matchMedia(CAPPED_VIEWPORT_QUERY).matches;

        setIsScrollable(isCapped && viewport.scrollHeight > viewport.clientHeight + 1);
    }, []);

    useEffect(() => {
        const viewport = viewportRef.current;

        if (!viewport || typeof ResizeObserver === 'undefined') {
            return;
        }

        const observer = new ResizeObserver(measure);
        observer.observe(viewport);

        const query = typeof window.matchMedia === 'function' ? window.matchMedia(CAPPED_VIEWPORT_QUERY) : null;
        query?.addEventListener('change', measure);

        return () => {
            observer.disconnect();
            query?.removeEventListener('change', measure);
        };
    }, [measure]);

    return (
        <>
            <div
                ref={viewportRef}
                role={isScrollable ? 'region' : undefined}
                aria-label={isScrollable ? copy.scrollable(alt) : undefined}
                tabIndex={isScrollable ? 0 : undefined}
                className="bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 md:max-h-[min(65vh,720px)] md:overflow-y-auto"
            >
                <img src={src} alt={alt} decoding="async" onLoad={measure} className="block h-auto w-full" />
            </div>
            {isScrollable && (
                <p className="border-t bg-muted/60 px-3.5 py-2 text-xs text-muted-foreground">{copy.scrollHint}</p>
            )}
        </>
    );
}
