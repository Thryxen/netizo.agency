import { type RefObject, useEffect } from 'react';
import { useCanAnimate, useReducedMotionPreference } from '@/components/motion/motion-env';
import { type Locale, useLocale } from '@/lib/i18n';
import { createPhotoReveal, type PhotoReveal } from './stage-photo';
import {
    clamp01,
    CODE_SCHEDULE,
    codeCharacters,
    CURSOR_TIMES,
    DRAGS,
    dragProgress,
    easeInOut,
    easeOut,
    type Frame,
    LOOP,
    PHOTO_REVEALS,
    pipelineState,
    progress,
    SCORE,
    scoreProgress,
    stepState,
    LOCALIZED_TRACKS,
    type Track,
    translate,
    urlCharacters,
} from './timeline';

/** Largest tilt in degrees (spec: ≤ 6°), and the idle drift's amplitude. */
const TILT_Y = 6;
const TILT_X = 4.5;
const DRIFT_Y = 2.2;
const DRIFT_X = 1.3;
/** Spring for the tilt (slightly under-damped, ζ ≈ 0.8). */
const STIFFNESS = 55;
const DAMPING = 12;
/** One badge pixel per 1/24 em: the window reads as a 1392 px wide page. */
const BADGE_PX_PER_EM = 24;
/** Frame-time cap, so a resumed tab never jumps ahead. */
const MAX_STEP_S = 0.1;

type Point = { x: number; y: number };
type Box = Point & { width: number; height: number };

/** Writes transform/opacity/attributes only when they change, and can undo every write (back to the static frame). */
function createWriter() {
    const styles = new Map<HTMLElement | SVGElement, Map<string, string>>();
    const attributes = new Map<Element, Map<string, string | null>>();

    return {
        style(element: HTMLElement | SVGElement, property: 'opacity' | 'transform', value: string): void {
            let written = styles.get(element);

            if (!written) {
                written = new Map();
                styles.set(element, written);
            }

            if (written.get(property) !== value) {
                written.set(property, value);
                element.style.setProperty(property, value);
            }
        },
        frame(element: HTMLElement, frame: Frame): void {
            if (frame.opacity !== undefined) {
                this.style(element, 'opacity', String(frame.opacity));
            }

            if (frame.transform !== undefined) {
                this.style(element, 'transform', frame.transform);
            }
        },
        attribute(element: Element, name: string, value: string): void {
            let original = attributes.get(element);

            if (!original) {
                original = new Map();
                attributes.set(element, original);
            }

            if (!original.has(name)) {
                original.set(name, element.getAttribute(name));
            }

            if (element.getAttribute(name) !== value) {
                element.setAttribute(name, value);
            }
        },
        reset(): void {
            for (const [element, written] of styles) {
                for (const property of written.keys()) {
                    element.style.removeProperty(property);
                }
            }

            for (const [element, original] of attributes) {
                for (const [name, value] of original) {
                    if (value === null) {
                        element.removeAttribute(name);
                    } else {
                        element.setAttribute(name, value);
                    }
                }
            }

            styles.clear();
            attributes.clear();
        },
    };
}

/** Offset of `element` inside `container` (layout coordinates: transforms do not count). */
function offsetWithin(element: HTMLElement, container: Element): Box {
    let x = 0;
    let y = 0;
    let node: HTMLElement | null = element;

    while (node && node !== container) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
    }

    return { x, y, width: element.offsetWidth, height: element.offsetHeight };
}

const lerp = (from: Point, to: Point, amount: number): Point => ({ x: from.x + (to.x - from.x) * amount, y: from.y + (to.y - from.y) * amount });

/**
 * Everything the stage shows at loop time `t`, written to the DOM: the TRACKS, the typing, the pipeline and step
 * states, the score, the photos and the cursor. Pure function of `t` + the measured layout.
 */
function createStage(root: HTMLElement, locale: Locale) {
    const write = createWriter();
    const query = <T extends Element = HTMLElement>(selector: string): T[] => Array.from(root.querySelectorAll<T>(selector));
    const one = (selector: string): HTMLElement | null => root.querySelector<HTMLElement>(selector);

    const tracked = query('[data-lb]').flatMap((element) => {
        const track = LOCALIZED_TRACKS[locale][element.dataset.lb ?? ''] as Track | undefined;

        return track ? [{ element, track }] : [];
    });
    const url = one('[data-lb-url]');
    const urlLength = url?.textContent?.length ?? 0;
    const urlCover = one('[data-lb-url-cover]');
    const codeSchedule = CODE_SCHEDULE[locale];
    const codeRows = query('[data-lb-code-row]');
    const codeCovers = query('[data-lb-code]');
    const steps = query('[data-lb-step]');
    const pipes = query('[data-lb-pipe]');
    const ticks = query<SVGElement>('[data-lb-tick]');
    const score = one('[data-lb-score]');
    const cursor = one('[data-lb="cursor"]');
    const arrow = one('[data-lb="cursor-arrow"]');
    const ripple = one('[data-lb="cursor-ripple"]');
    const rippleRing = one('[data-lb="cursor-ripple-ring"]');
    const badge = one('[data-lb="cursor-badge"]');
    const badgeText = one('[data-lb-badge-text]');
    const photos: PhotoReveal[] = query('[data-lb-photo]').flatMap((slot) => {
        const timing = PHOTO_REVEALS[slot.dataset.lbPhoto ?? ''] as { at: number; duration: number } | undefined;

        return timing ? [createPhotoReveal(slot, timing.at, timing.duration)] : [];
    });

    let path: { enter: Point; hero: Box; card: Box; cta: Point; exit: Point } | null = null;
    let lastBadge = '';
    let lastScore = '';

    /** Cursor targets in em of the page (re-measured after a resize). */
    const measure = (): void => {
        const container = cursor?.offsetParent;
        const hero = one('[data-lb-target="hero"]');
        const card = one('[data-lb-target="card-0"]');
        const cta = one('[data-lb-target="cta"]');

        if (!cursor || !container || !hero || !card || !cta) {
            path = null;

            return;
        }

        const unit = parseFloat(window.getComputedStyle(cursor).fontSize) || 1;
        const toEm = (box: Box): Box => ({ x: box.x / unit, y: box.y / unit, width: box.width / unit, height: box.height / unit });
        const heroBox = toEm(offsetWithin(hero, container));
        const ctaBox = toEm(offsetWithin(cta, container));
        const ctaPoint = { x: ctaBox.x + ctaBox.width * 0.62, y: ctaBox.y + ctaBox.height * 0.6 };

        path = {
            enter: { x: heroBox.x + heroBox.width * 0.55, y: heroBox.y + heroBox.height + 9 },
            hero: heroBox,
            card: toEm(offsetWithin(card, container)),
            cta: ctaPoint,
            exit: { x: ctaPoint.x + 4, y: ctaPoint.y + 5 },
        };
    };

    const renderCursor = (t: number): void => {
        if (!cursor || !arrow || !ripple || !rippleRing || !badge || !badgeText || !path) {
            return;
        }

        const { enter, hero, card, cta, exit } = path;
        const heroEnd = { x: hero.x + hero.width, y: hero.y + hero.height };
        const cardEnd = { x: card.x + card.width, y: card.y + card.height };
        let at: Point;

        if (t < DRAGS.hero.from) {
            at = lerp(enter, hero, easeInOut(progress(t, CURSOR_TIMES.toHero, DRAGS.hero.from - CURSOR_TIMES.toHero)));
        } else if (t < CURSOR_TIMES.toCard) {
            at = lerp(hero, heroEnd, dragProgress(t, DRAGS.hero));
        } else if (t < DRAGS.card.from) {
            at = lerp(heroEnd, card, easeInOut(progress(t, CURSOR_TIMES.toCard, DRAGS.card.from - CURSOR_TIMES.toCard)));
        } else if (t < CURSOR_TIMES.toCta) {
            at = lerp(card, cardEnd, dragProgress(t, DRAGS.card));
        } else if (t < CURSOR_TIMES.leave) {
            at = lerp(cardEnd, cta, easeInOut(progress(t, CURSOR_TIMES.toCta, CURSOR_TIMES.click - CURSOR_TIMES.toCta)));
        } else {
            at = lerp(cta, exit, easeOut(progress(t, CURSOR_TIMES.leave, 0.5)));
        }

        const visible = clamp01(progress(t, CURSOR_TIMES.enter, 0.2) - progress(t, CURSOR_TIMES.leave, 0.3));

        write.frame(cursor, { opacity: Math.round(visible * 1000) / 1000, transform: visible > 0 ? translate(at.x, at.y) : 'none' });

        // Click: the arrow presses, a ring spreads from the tip.
        const press = progress(t, CURSOR_TIMES.click, 0.1) - progress(t, CURSOR_TIMES.click + 0.1, 0.15);
        write.frame(arrow, { transform: press > 0 ? `scale(${Math.round((1 - 0.14 * press) * 1000) / 1000})` : 'none' });

        const spread = progress(t, CURSOR_TIMES.click + 0.02, 0.6);
        write.frame(ripple, { opacity: spread > 0 && spread < 1 ? Math.round(0.6 * (1 - spread) * 1000) / 1000 : 0 });
        write.frame(rippleRing, { transform: spread > 0 && spread < 1 ? `scale(${Math.round((0.3 + 1.2 * easeOut(spread)) * 1000) / 1000})` : 'scale(0.3)' });

        // Size readout while dragging.
        const drag = t >= DRAGS.hero.from && t < DRAGS.hero.to + 0.2 ? { box: hero, at: dragProgress(t, DRAGS.hero) } : t >= DRAGS.card.from && t < DRAGS.card.to + 0.2 ? { box: card, at: dragProgress(t, DRAGS.card) } : null;

        write.frame(badge, { opacity: drag && drag.at > 0.04 ? 1 : 0 });

        if (drag) {
            const text = `${Math.round(drag.box.width * drag.at * BADGE_PX_PER_EM)} × ${Math.round(drag.box.height * drag.at * BADGE_PX_PER_EM)}`;

            if (text !== lastBadge) {
                lastBadge = text;
                badgeText.textContent = text;
            }
        }
    };

    const cover = (element: HTMLElement | null, typed: number, length: number): void => {
        if (element) {
            write.style(element, 'transform', typed >= length ? 'translateX(101%)' : `translateX(${Math.max(0, typed)}ch)`);
        }
    };

    return {
        measure,
        render(t: number): void {
            for (const { element, track } of tracked) {
                write.frame(element, track(t));
            }

            if (url) {
                write.style(url, 'opacity', '1');
            }

            cover(urlCover, urlCharacters(t, urlLength), urlLength);

            codeSchedule.forEach((line, index) => {
                const typed = codeCharacters(t, line);

                if (codeRows[index]) {
                    write.style(codeRows[index], 'opacity', typed >= 0 ? '1' : '0');
                }

                cover(codeCovers[index] ?? null, typed, line.length);
            });

            steps.forEach((step, index) => write.attribute(step, 'data-state', stepState(t, index)));
            pipes.forEach((pipe, index) => write.attribute(pipe, 'data-state', pipelineState(t, index)));

            const scored = scoreProgress(t);
            const lit = Math.floor(scored * SCORE.ticks + 0.0001);

            ticks.forEach((tick, index) => write.style(tick, 'opacity', index < lit ? '1' : '0.15'));

            const scoreText = String(Math.round(scored * 100));

            if (score && scoreText !== lastScore) {
                lastScore = scoreText;
                score.textContent = scoreText;
            }

            for (const photo of photos) {
                photo.render(t);
            }

            renderCursor(t);
        },
        reset(): void {
            write.reset();
            photos.forEach((photo) => photo.reset());

            if (score) {
                score.textContent = '100';
            }

            if (badgeText) {
                badgeText.textContent = '0 × 0';
            }

            lastScore = '';
            lastBadge = '';
        },
    };
}

/**
 * Pointer tilt for the scene: rotateX/Y (≤ 6°) toward the pointer while it is over the hero, a slow drift otherwise,
 * both through one spring. Fine pointers only (never on touch).
 */
function createTilt(root: HTMLElement, scene: HTMLElement) {
    const area = root.closest('section') ?? root;
    let pointer: Point | null = null;
    /** The idle drift starts from rest when the clock (re)starts. */
    let driftFrom: number | null = null;
    let rotation = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 };
    let written = '';

    const onMove = (event: PointerEvent): void => {
        if (event.pointerType === 'mouse') {
            pointer = { x: event.clientX, y: event.clientY };
        }
    };
    const onLeave = (): void => {
        pointer = null;
    };

    area.addEventListener('pointermove', onMove, { passive: true });
    area.addEventListener('pointerleave', onLeave);

    return {
        step(dt: number, now: number): void {
            let target: Point;

            if (pointer) {
                const rect = root.getBoundingClientRect();
                const nx = Math.max(-1, Math.min(1, (pointer.x - (rect.left + rect.width / 2)) / (rect.width * 0.6)));
                const ny = Math.max(-1, Math.min(1, (pointer.y - (rect.top + rect.height / 2)) / (rect.height * 0.6)));

                target = { x: -ny * TILT_X, y: nx * TILT_Y };
            } else {
                driftFrom ??= now;

                const seconds = (now - driftFrom) / 1000;

                target = { x: Math.sin(seconds * 0.7) * DRIFT_X, y: Math.sin(seconds * 0.45) * DRIFT_Y };
            }

            velocity = {
                x: velocity.x + (STIFFNESS * (target.x - rotation.x) - DAMPING * velocity.x) * dt,
                y: velocity.y + (STIFFNESS * (target.y - rotation.y) - DAMPING * velocity.y) * dt,
            };
            rotation = { x: rotation.x + velocity.x * dt, y: rotation.y + velocity.y * dt };

            const value = `rotateX(${rotation.x.toFixed(3)}deg) rotateY(${rotation.y.toFixed(3)}deg)`;

            if (value !== written) {
                written = value;
                scene.style.transform = value;
            }
        },
        destroy(): void {
            area.removeEventListener('pointermove', onMove);
            area.removeEventListener('pointerleave', onLeave);
            scene.style.removeProperty('transform');
        },
    };
}

/**
 * Runs the LiveBuild: one requestAnimationFrame clock advances the loop time and renders the stage (+ the tilt). It runs
 * only while the stage is on screen and the tab is visible, never under reduced motion or when the `js` gate is closed
 * (then the server-rendered finished page simply stays). No React state per frame: all writes go straight to the DOM.
 */
export function useLiveBuild(rootRef: RefObject<HTMLElement | null>): void {
    const reduced = useReducedMotionPreference();
    const canAnimate = useCanAnimate();
    const locale = useLocale();

    useEffect(() => {
        const root = rootRef.current;
        const scene = root?.querySelector<HTMLElement>('[data-lb-scene]');

        if (!root || !scene || reduced || !canAnimate()) {
            return;
        }

        const stage = createStage(root, locale);
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const tilt = finePointer ? createTilt(root, scene) : null;
        let t = 0;
        let last: number | null = null;
        let frame = 0;
        let inView = false;
        let measured = false;

        stage.measure();
        stage.render(0);
        root.setAttribute('data-lb-live', '');

        const tick = (now: number): void => {
            const dt = last === null ? 0 : Math.min(MAX_STEP_S, (now - last) / 1000);
            last = now;

            if (!measured) {
                measured = true;
                stage.measure();
            }

            t = (t + dt) % LOOP;
            stage.render(t);
            tilt?.step(dt, now);
            frame = window.requestAnimationFrame(tick);
        };

        const update = (): void => {
            const run = inView && document.visibilityState === 'visible';

            // CSS loops on the stage (the current step's pulse) run only while the clock does.
            root.toggleAttribute('data-lb-running', run);

            if (run && frame === 0) {
                last = null;
                frame = window.requestAnimationFrame(tick);
            } else if (!run && frame !== 0) {
                window.cancelAnimationFrame(frame);
                frame = 0;
            }
        };

        const visibility = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            update();
        });
        const resize = new ResizeObserver(() => (measured = false));

        visibility.observe(root);
        resize.observe(root);
        document.addEventListener('visibilitychange', update);

        return () => {
            window.cancelAnimationFrame(frame);
            visibility.disconnect();
            resize.disconnect();
            document.removeEventListener('visibilitychange', update);
            tilt?.destroy();
            stage.reset();
            root.removeAttribute('data-lb-live');
            root.removeAttribute('data-lb-running');
        };
    }, [rootRef, reduced, canAnimate, locale]);
}
