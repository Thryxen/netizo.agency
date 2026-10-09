import { cubicBezier } from 'motion/react';
import { motionTokens } from '@/components/motion/motion-env';
import type { Localized } from '@/lib/i18n';
import { BUILD_STEP_COUNT, CODE_LINE_HERO, CODE_LINE_PRODUCTS, type CodeToken, SHOP } from './shop-data';

/**
 * The LiveBuild timeline, in seconds: one loop builds the shop site in four acts, holds the finished page, then wipes
 * it and starts again. Everything on the stage is a pure function of the loop time `t`, so a frame can be rendered
 * for any moment (the clock only advances `t`).
 *
 *  Projekt    0.0–2.0  the phone slides in; wireframes draw in (desktop + phone); the cursor drags out the photo
 *                      slots, clicks the button
 *  Design     2.0–4.5  real text rises, photos fade in (colour enters), prices land, the phone too
 *  Kod        4.5–6.5  the editor slides in and types the page's component; typed lines light up their section
 *  Wdrożenie  6.5–9.4  pipeline ticks, "Opublikowano", score ring to 100, an order lands on the phone
 *  hold       9.4–11.4 the finished composition (= the static frame for SSR, no JS and reduced motion)
 *  wipe      11.4–11.9 a panel sweeps the page clean, the floating layers drop away
 */
export const LOOP = 11.9;
export const ACT_STARTS = [0, 2, 4.5, 6.5] as const;
export const BUILT_AT = 9.4;
export const WIPE_AT = 11.4;
const WIPE_DURATION = 0.45;
const STEPS_RESET_AT = WIPE_AT + 0.22;

export const easeOut = cubicBezier(...motionTokens.ease);
export const easeInOut = cubicBezier(0.65, 0, 0.35, 1);
const easeIn = cubicBezier(0.5, 0, 0.75, 0);

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** Linear progress of `t` through [at, at + duration]. */
export const progress = (t: number, at: number, duration: number): number => clamp01((t - at) / duration);

/** One element's look at a moment: only transform and opacity. `undefined` leaves the property alone. */
export type Frame = { opacity?: number; transform?: string };
export type Track = (t: number) => Frame;

const round = (value: number): number => Math.round(value * 1000) / 1000;

/** `translate3d` in em (the stage unit) or `none` at rest, so settled elements drop their compositing layer. */
export function translate(x: number, y: number, unit = 'em'): string {
    const rx = round(x);
    const ry = round(y);

    return rx === 0 && ry === 0 ? 'none' : `translate3d(${rx}${unit}, ${ry}${unit}, 0)`;
}

/** The floating layers fade and drop away during the wipe. */
export const wipeOut = (t: number): number => easeIn(progress(t, WIPE_AT, 0.22));

/** The page panel's sweep: 0 = out of view on the left, 1 = covering the page. */
export const wipeSweep = (t: number): number => (t < WIPE_AT ? 0 : easeInOut(progress(t, WIPE_AT, WIPE_DURATION)));

/** Fade + rise into place; holds until the loop wraps. */
function rise(at: number, { duration = 0.5, distance = 0.5 } = {}): Track {
    return (t) => {
        const shown = easeOut(progress(t, at, duration));

        return { opacity: round(shown), transform: translate(0, distance * (1 - shown)) };
    };
}

/**
 * A floating layer: rises in (slight scale), then drops away during the wipe. Opacity settles much faster than the
 * movement, so a dark layer (the editor) never lingers as a translucent grey slab.
 */
function float(at: number, { duration = 0.7, distance = 1.4 } = {}): Track {
    return (t) => {
        const moved = easeOut(progress(t, at, duration));
        const shown = easeOut(progress(t, at, 0.22));
        const gone = wipeOut(t);
        const y = round(distance * (1 - moved) + 0.8 * gone);
        const scale = round(0.985 + 0.015 * moved);

        return { opacity: round(shown * (1 - gone)), transform: y === 0 && scale === 1 ? 'none' : `translate3d(0, ${y}em, 0) scale(${scale})` };
    };
}

/** A headline line rising out of its mask (like the page's own H1). */
function lineRise(at: number): Track {
    return (t) => {
        const shown = easeOut(progress(t, at, 0.75));

        return { opacity: t < at ? 0 : 1, transform: translate(0, 110 * (1 - shown), '%') };
    };
}

type WireframeOptions = {
    /** Seconds the wireframe takes to appear. */
    duration?: number;
    /** When the design replaces it. */
    out: number;
    /** Seconds the hand-over fade takes. */
    outDuration?: number;
    /** Bars grow from the left edge instead of fading in place. */
    grow?: boolean;
};

/** A wireframe placeholder: appears in act 1, fades as the real content replaces it in act 2. */
function wireframe(at: number, { duration = 0.3, out, outDuration = 0.3, grow = false }: WireframeOptions): Track {
    return (t) => {
        const shown = easeOut(progress(t, at, duration));
        const gone = progress(t, out, outDuration);

        return {
            opacity: round(Math.min(shown, 1) * (1 - gone)),
            transform: grow ? (shown >= 1 ? 'none' : `scaleX(${round(0.2 + 0.8 * shown)})`) : undefined,
        };
    };
}

/** Wireframe rectangles the cursor drags out (top-left → bottom-right), then hands over to the dashed slot. */
export const DRAGS = {
    hero: { from: 0.42, to: 0.98 },
    card: { from: 1.24, to: 1.6 },
} as const;

/** Eased drag progress (the marquee's corner and the cursor move together). */
export const dragProgress = (t: number, drag: { from: number; to: number }): number => easeInOut(progress(t, drag.from, drag.to - drag.from));

/** The marquee being dragged: visible only while dragging, scaled from its top-left corner. */
function marquee(drag: { from: number; to: number }): Track {
    return (t) => {
        if (t < drag.from || t > drag.to + 0.12) {
            return { opacity: 0, transform: 'scale(0)' };
        }

        const size = Math.max(0.001, dragProgress(t, drag));

        return { opacity: t > drag.to ? round(1 - progress(t, drag.to, 0.12)) : 1, transform: `scale(${round(size)})` };
    };
}

/** Cards 2 and 3 are duplicated from card 1: they slide out of its slot into their own. */
function duplicate(index: number, at: number, out: number): Track {
    return (t) => {
        const placed = easeOut(progress(t, at, 0.4));
        const gone = progress(t, out, 0.3);
        const back = 1 - placed;

        return {
            opacity: round((t < at ? 0 : 0.35 + 0.65 * placed) * (1 - gone)),
            transform: back === 0 ? 'none' : `translate3d(calc(${round(-index * 100 * back)}% - ${round(index * 1.4 * back)}em), 0, 0)`,
        };
    };
}

/** While a line of code is typed (plus a beat), the matching section of the page is outlined. */
function highlight(from: number, to: number): Track {
    return (t) => ({ opacity: round(progress(t, from, 0.15) * (1 - progress(t, to, 0.3))) });
}

/* ---------------------------------------------------------------------------------------------------------------- */

/** When each photo starts fading in, and for how long (seconds). */
export const PHOTO_REVEALS: Record<string, { at: number; duration: number }> = {
    hero: { at: 2.25, duration: 0.7 },
    'card-0': { at: 2.6, duration: 0.6 },
    'card-1': { at: 2.75, duration: 0.6 },
    'card-2': { at: 2.9, duration: 0.6 },
};

/** URL typed into the address bar at the start, erased again during the wipe. */
export const URL_TYPING = { from: 0.15, to: 0.7, eraseFrom: 11.45, eraseTo: 11.75 } as const;

/** Characters of the URL (`length` long, in the page's language) visible at `t`. */
export function urlCharacters(t: number, length: number): number {
    if (t >= URL_TYPING.eraseFrom) {
        return Math.round(length * (1 - progress(t, URL_TYPING.eraseFrom, URL_TYPING.eraseTo - URL_TYPING.eraseFrom)));
    }

    return Math.floor(length * progress(t, URL_TYPING.from, URL_TYPING.to - URL_TYPING.from) + 0.0001);
}

/**
 * Typing schedule for the editor: indentation appears at once (auto-indent), the rest at a steady pace with a
 * short pause between lines.
 */
const CODE_START = 4.95;
const CODE_CHAR = 0.0088;
const CODE_LINE_PAUSE = 0.05;

export type CodeLineSchedule = { from: number; to: number; indent: number; length: number };

function codeSchedule(code: CodeToken[][]): CodeLineSchedule[] {
    let cursor = CODE_START;

    return code.map((tokens) => {
        const text = tokens.map(([part]) => part).join('');
        const indent = text.length - text.trimStart().length;
        const typed = text.length - indent;
        const line = { from: cursor, to: cursor + typed * CODE_CHAR, indent, length: text.length };

        cursor = line.to + CODE_LINE_PAUSE;

        return line;
    });
}

/** The editor's typing schedule in each language (the code's text differs, so does its length). */
export const CODE_SCHEDULE: Localized<CodeLineSchedule[]> = { pl: codeSchedule(SHOP.pl.code), en: codeSchedule(SHOP.en.code) };

/** Characters of a code line visible at `t` (-1 = the line has not started: no caret either). */
export function codeCharacters(t: number, line: CodeLineSchedule): number {
    if (t < line.from) {
        return -1;
    }

    return Math.min(line.length, line.indent + Math.floor(((t - line.from) / (line.to - line.from)) * (line.length - line.indent)));
}

/** Pipeline stages: pending → running → done. */
export const PIPELINE_TIMES = [
    { from: 6.7, to: 7.05 },
    { from: 7.05, to: 7.45 },
    { from: 7.45, to: 7.85 },
] as const;

export type StageState = 'pending' | 'running' | 'done';

export function pipelineState(t: number, index: number): StageState {
    const stage = PIPELINE_TIMES[index];

    return t >= stage.to ? 'done' : t >= stage.from ? 'running' : 'pending';
}

/** Score ring: counts 0 → 100 while its 24 ticks light up. */
export const SCORE = { from: 8.15, duration: 1, ticks: 24 } as const;

export const scoreProgress = (t: number): number => easeOut(progress(t, SCORE.from, SCORE.duration));

/** Index of the act playing at `t` (0–3; the hold and the wipe count as the last act). */
export function actAt(t: number): number {
    let act = 0;

    ACT_STARTS.forEach((start, index) => {
        if (t >= start) {
            act = index;
        }
    });

    return act;
}

/** Build steps over the window: `live` = current act (its marker pulses), `active` = finished page, last step. */
export type StepState = 'pending' | 'live' | 'active' | 'done';

export function stepState(t: number, index: number): StepState {
    // The finished page keeps its steps until the wipe has swept half of it away.
    if (t >= BUILT_AT && t < STEPS_RESET_AT) {
        return index === BUILD_STEP_COUNT - 1 ? 'active' : 'done';
    }

    if (t >= STEPS_RESET_AT) {
        return 'pending';
    }

    const act = actAt(t);

    return index < act ? 'done' : index === act ? 'live' : 'pending';
}

/** Connector between step `index` and the next: fills over act `index`, empties during the wipe. */
export function stepLink(t: number, index: number): Frame {
    const end = ACT_STARTS[index + 1] ?? BUILT_AT;
    const filled = progress(t, ACT_STARTS[index], end - ACT_STARTS[index]) * (1 - easeInOut(progress(t, WIPE_AT, 0.4)));

    return { transform: filled >= 1 ? 'none' : `scaleX(${round(filled)})` };
}

/** Cursor path, in the page's own em coordinates (targets are measured from the layout). */
export const CURSOR_TIMES = {
    enter: 0.08,
    toHero: 0.12,
    toCard: 0.98,
    toCta: 1.62,
    click: 2,
    leave: 2.18,
} as const;

/* ---------------------------------------------------------------------------------------------------------------- */

const WF_NAV_OUT = 2.05;
/** The shop headline's lines rise one after another; each wireframe bar clears just before its line. */
const HEAD_RISE = [2.14, 2.22, 2.3] as const;

/** The simple tracks, by `data-lb` key. Elements with special behaviour (typing, photos, cursor) are driven elsewhere. */
const TRACKS: Record<string, Track> = {
    // Act 1: wireframe.
    'wf-logo': wireframe(0.12, { out: WF_NAV_OUT }),
    'wf-links': wireframe(0.2, { out: WF_NAV_OUT, grow: true }),
    'wf-cart': wireframe(0.28, { out: WF_NAV_OUT }),
    'wf-head-0': wireframe(0.46, { out: HEAD_RISE[0] - 0.06, outDuration: 0.14, grow: true }),
    'wf-head-1': wireframe(0.53, { out: HEAD_RISE[1] - 0.06, outDuration: 0.14, grow: true }),
    'wf-head-2': wireframe(0.6, { out: HEAD_RISE[2] - 0.06, outDuration: 0.14, grow: true }),
    'wf-lead': wireframe(0.7, { out: 2.36, outDuration: 0.14, grow: true }),
    'wf-cta': wireframe(0.8, { out: 2.44, outDuration: 0.14 }),
    'wf-hero-draw': marquee(DRAGS.hero),
    'wf-hero': wireframe(DRAGS.hero.to - 0.02, { duration: 0.2, out: PHOTO_REVEALS.hero.at + 0.05 }),
    'wf-card-0-draw': marquee(DRAGS.card),
    'wf-card-0': wireframe(DRAGS.card.to - 0.02, { duration: 0.2, out: PHOTO_REVEALS['card-0'].at + 0.05 }),
    'wf-card-1': duplicate(1, 1.66, PHOTO_REVEALS['card-1'].at + 0.05),
    'wf-card-2': duplicate(2, 1.76, PHOTO_REVEALS['card-2'].at + 0.05),
    'wf-caption-0': wireframe(1.8, { out: 3.4, outDuration: 0.14, grow: true }),
    'wf-caption-1': wireframe(1.92, { out: 3.5, outDuration: 0.14, grow: true }),
    'wf-caption-2': wireframe(2.02, { out: 3.6, outDuration: 0.14, grow: true }),

    // Act 2: design.
    nav: rise(2.05, { duration: 0.5, distance: 0.4 }),
    'head-0': lineRise(HEAD_RISE[0]),
    'head-1': lineRise(HEAD_RISE[1]),
    'head-2': lineRise(HEAD_RISE[2]),
    lead: rise(2.42, { distance: 0.5 }),
    cta: rise(2.5, { distance: 0.5 }),
    'caption-0': rise(3.45, { distance: 0.4 }),
    'caption-1': rise(3.55, { distance: 0.4 }),
    'caption-2': rise(3.65, { distance: 0.4 }),

    // Act 3: code.
    editor: float(4.5, { duration: 0.75, distance: 2 }),

    // The phone is on stage from the start (the right side never sits empty): its wireframe draws with the desktop's,
    // the design lands with the desktop's, the order arrives in act 4.
    phone: float(0.05, { duration: 0.8, distance: 3 }),
    'phone-wf': wireframe(0.35, { duration: 0.4, out: 2.5, outDuration: 0.35 }),
    'phone-design': rise(2.55, { duration: 0.6, distance: 0.4 }),

    // Act 4: deploy.
    deploy: float(6.5),
    published: float(7.9, { duration: 0.6, distance: 1 }),
    score: float(8),
    'phone-toast': (t) => {
        const shown = easeOut(progress(t, 8.95, 0.6));

        return { opacity: t < 8.95 ? 0 : 1, transform: translate(0, -130 * (1 - shown), '%') };
    },

    // Steps.
    'link-0': (t) => stepLink(t, 0),
    'link-1': (t) => stepLink(t, 1),
    'link-2': (t) => stepLink(t, 2),

    // Wipe: the page panel sweeps in from the left; gone again when the loop wraps.
    wipe: (t) => {
        const sweep = wipeSweep(t);

        return { opacity: sweep > 0 ? 1 : 0, transform: sweep >= 1 ? 'none' : `translate3d(${round(-101 * (1 - sweep))}%, 0, 0)` };
    },
    // Its leading edge fades as it reaches the window's border (no doubled line).
    'wipe-edge': (t) => ({ opacity: round(1 - progress(t, WIPE_AT + WIPE_DURATION - 0.12, 0.1)) }),
};

/** Act 3: while the editor types a component's line, its section of the page is outlined (timed per language). */
const codeHighlights = (schedule: CodeLineSchedule[]): Record<string, Track> => ({
    'hl-hero': highlight(schedule[CODE_LINE_HERO].from - 0.05, schedule[CODE_LINE_HERO].to + 0.45),
    'hl-products': highlight(schedule[CODE_LINE_PRODUCTS].from - 0.05, schedule[CODE_LINE_PRODUCTS].to + 0.45),
});

/** The simple tracks of each language: the shared ones plus that language's code highlights. */
export const LOCALIZED_TRACKS: Localized<Record<string, Track>> = {
    pl: { ...TRACKS, ...codeHighlights(CODE_SCHEDULE.pl) },
    en: { ...TRACKS, ...codeHighlights(CODE_SCHEDULE.en) },
};
