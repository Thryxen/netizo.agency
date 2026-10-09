import { Check, Globe, LoaderCircle, Menu, ShoppingBag } from 'lucide-react';
import { Fragment } from 'react';
import { useCopy } from '@/lib/i18n';
import { photo } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { type CodeTone, SHOP } from './shop-data';
import { SlotCross } from './shop-window';
import { SCORE } from './timeline';

/** Floating layers sit over the window: a hairline plus a soft, short shadow in light mode (dark mode: hairline only). */
export const FLOAT_SURFACE = 'border bg-background shadow-[0_0.1em_0.25em_rgb(0_0_0/0.04),0_1.4em_2.6em_-1em_rgb(0_0_0/0.18)] dark:shadow-none';

/**
 * The build's four steps over the window. A real sequence: the current step's square pulses, finished ones stay filled,
 * the connector fills while its step plays. Its look comes from data-state (styles in live-build-styles).
 */
export function StepIndicator() {
    const { buildSteps } = useCopy(SHOP);

    return (
        <div className="flex h-[3.4em] w-fit items-center gap-[1em] rounded-[0.7em] border bg-background px-[1.2em]">
            {buildSteps.map((label, index) => (
                <Fragment key={label}>
                    {index > 0 && (
                        <span className="relative h-px w-[2.2em] bg-border">
                            <span data-lb={`link-${index - 1}`} data-lb-fill="" className="absolute inset-0 origin-left bg-foreground" />
                        </span>
                    )}
                    <span data-lb-step={index} data-state={index === buildSteps.length - 1 ? 'active' : 'done'} className="flex items-center gap-[0.6em]">
                        <span data-lb-marker="" className="size-[0.75em] shrink-0" />
                        <span data-lb-label="" className="text-[1.15em] font-medium whitespace-nowrap">
                            {label}
                        </span>
                    </span>
                </Fragment>
            ))}
        </div>
    );
}

const TICKS = Array.from({ length: SCORE.ticks }, (_, index) => index);

/** Performance report, as in the bento's web tile: a ring of 24 ticks that light up while the score counts to 100. */
export function ScoreCard() {
    const shop = useCopy(SHOP);

    return (
        <div className={cn('flex w-fit items-center gap-[1em] rounded-[0.8em] py-[0.9em] pr-[1.6em] pl-[0.9em]', FLOAT_SURFACE)}>
            <span className="relative size-[5.4em] shrink-0">
                <svg viewBox="0 0 56 56" className="absolute inset-0 size-full">
                    {TICKS.map((tick) => (
                        <rect key={tick} data-lb-tick="" x="27" y="1" width="2" height="6" transform={`rotate(${tick * 15} 28 28)`} className="fill-foreground" />
                    ))}
                </svg>
                <span data-lb-score="" className="absolute inset-0 flex items-center justify-center text-[1.45em] font-semibold tracking-tight tabular-nums">
                    100
                </span>
            </span>
            <span className="text-[1.1em] leading-[1.4] whitespace-nowrap">
                <span className="block font-medium">{shop.performance}</span>
                <span className="block text-muted-foreground">{shop.metrics}</span>
            </span>
        </div>
    );
}

/** Deploy pipeline: Build ✓ Testy ✓ Deploy ✓, each pending → running → done (via data-state). */
export function PipelineChip() {
    const { pipeline } = useCopy(SHOP);

    return (
        <div className={cn('flex w-fit items-center gap-[1.3em] rounded-[0.8em] px-[1.1em] py-[0.95em]', FLOAT_SURFACE)}>
            {pipeline.map((label, index) => (
                <span key={label} data-lb-pipe={index} data-state="done" className="group/pipe flex items-center gap-[0.55em]">
                    <span
                        className={cn(
                            'flex size-[1.8em] items-center justify-center rounded-[0.35em] border border-dashed border-input text-foreground',
                            'group-data-[state=running]/pipe:border-solid group-data-[state=running]/pipe:border-foreground',
                            'group-data-[state=done]/pipe:border-solid group-data-[state=done]/pipe:border-foreground group-data-[state=done]/pipe:bg-foreground group-data-[state=done]/pipe:text-background',
                        )}
                    >
                        <Check aria-hidden="true" className="hidden size-[1.1em] group-data-[state=done]/pipe:block" strokeWidth={2.75} />
                        <LoaderCircle aria-hidden="true" className="hidden size-[1.1em] animate-spin group-data-[state=running]/pipe:block" strokeWidth={2.5} />
                    </span>
                    <span className="text-[1.1em] font-medium">{label}</span>
                </span>
            ))}
        </div>
    );
}

/** The toast once the pipeline is green: where the site went live. */
export function PublishedToast() {
    const shop = useCopy(SHOP);

    return (
        <div className={cn('flex w-fit items-center gap-[0.8em] rounded-[0.8em] py-[0.8em] pr-[1.3em] pl-[0.8em]', FLOAT_SURFACE)}>
            <span className="flex size-[2.4em] shrink-0 items-center justify-center rounded-[0.45em] bg-foreground text-background">
                <Globe aria-hidden="true" className="size-[1.25em]" strokeWidth={1.75} />
            </span>
            <span className="text-[1.1em] leading-[1.35] whitespace-nowrap">
                <span className="block font-medium">{shop.published}</span>
                <span className="block text-muted-foreground">{shop.url}</span>
            </span>
        </div>
    );
}

/** Editor surface: dark in both themes (it is a code editor); a step lighter than the page in dark mode. */
const EDITOR_SURFACE = 'bg-[oklch(0.2_0_0)] dark:bg-[oklch(0.225_0_0)]';

/** Monochrome syntax: opacity steps of white. */
const TONE: Record<CodeTone, string> = {
    keyword: 'text-white/45',
    tag: 'text-white',
    attr: 'text-white/60',
    string: 'text-white/85',
    punct: 'text-white/40',
    plain: 'text-white/80',
};

/**
 * The code editor: the shop page as a React component, typed line by line. Each line has a cover (editor colour) whose
 * left edge is the caret; the clock slides it right as characters are typed (transform only).
 */
export function CodeEditor() {
    const { code } = useCopy(SHOP);

    return (
        <div
            className={cn(
                'overflow-hidden rounded-[0.8em] border border-black/10 text-white shadow-[0_0.1em_0.25em_rgb(0_0_0/0.06),0_1.6em_3em_-1em_rgb(0_0_0/0.3)] dark:border-white/12 dark:shadow-none',
                EDITOR_SURFACE,
            )}
        >
            <div className="flex h-[2.6em] items-center border-b border-white/10">
                <span className="flex h-full items-center gap-[0.55em] border-r border-white/10 bg-white/[0.05] px-[1.1em]">
                    <span className="size-[0.5em] bg-white/70" />
                    <span className="text-[1.05em] text-white/85">Shop.tsx</span>
                </span>
                <span className="flex h-full items-center px-[1.1em] text-[1.05em] text-white/40">web.php</span>
            </div>
            <div className="py-[0.8em] font-mono">
                {code.map((tokens, index) => (
                    <div key={index} data-lb-code-row={index} data-lb-in="" className="flex h-[1.48em] items-center text-[1.05em]">
                        <span className="w-[2.7em] shrink-0 pr-[1.1em] text-right text-white/25 tabular-nums">{index + 1}</span>
                        <span className="relative min-w-0 overflow-hidden pr-[0.2em] whitespace-pre">
                            {tokens.map(([text, tone], tokenIndex) => (
                                <span key={tokenIndex} className={TONE[tone]}>
                                    {text}
                                </span>
                            ))}
                            <span data-lb-cover="" data-lb-code={index} className={cn('absolute inset-y-0 left-0 w-full', EDITOR_SURFACE)}>
                                <span className="absolute inset-y-[0.12em] left-0 w-[0.12em] bg-white/85" />
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const PHONE_BEZEL = 'bg-[oklch(0.22_0_0)] dark:bg-[oklch(0.32_0_0)]';
const PHONE_WF_SLOT = 'relative block rounded-[0.5em] border border-dashed border-foreground/30 bg-foreground/[0.025]';
const PHONE_WF_BAR = 'block rounded-full bg-foreground/12';

/** The phone's act-1 wireframe: the mobile layout sketched while the desktop one is (hidden in the finished page). */
function PhoneWireframe() {
    return (
        <div data-lb="phone-wf" className="pointer-events-none absolute inset-0 flex flex-col pt-[2.9em] opacity-0">
            <div className="flex items-center justify-between px-[1.1em]">
                <span className="flex items-center gap-[0.5em]">
                    <span className="size-[0.9em] border border-dashed border-foreground/35" />
                    <span className={cn(PHONE_WF_BAR, 'h-[0.7em] w-[5em]')} />
                </span>
                <span className="h-[1em] w-[1.4em] rounded-[0.2em] border border-dashed border-foreground/35" />
            </div>
            <span className={cn(PHONE_WF_SLOT, 'mx-[0.9em] mt-[0.9em] aspect-[4/3]')}>
                <SlotCross />
            </span>
            <span className={cn(PHONE_WF_BAR, 'mx-[1.1em] mt-[1.1em] h-[1.05em] w-[78%]')} />
            <span className={cn(PHONE_WF_BAR, 'mx-[1.1em] mt-[0.5em] h-[1.05em] w-[52%]')} />
            <span className="mx-[1.1em] mt-[0.9em] h-[2.7em] rounded-[0.5em] border border-dashed border-foreground/35" />
            <div className="mt-[1.2em] grid grid-cols-2 gap-[0.7em] px-[1.1em]">
                {[0, 1].map((index) => (
                    <span key={index} className="min-w-0">
                        <span className={cn(PHONE_WF_SLOT, 'aspect-square')}>
                            <SlotCross />
                        </span>
                        <span className={cn(PHONE_WF_BAR, 'mt-[0.6em] h-[0.6em] w-[70%]')} />
                        <span className={cn(PHONE_WF_BAR, 'mt-[0.4em] h-[0.6em] w-[40%]')} />
                    </span>
                ))}
            </div>
        </div>
    );
}

/**
 * The same shop on a phone (≥sm only). On screen for the whole loop so the stage's right side is never empty: its
 * wireframe draws with the desktop one, the design lands with it, and the order notification closes the loop.
 */
export function PhoneMock() {
    const shop = useCopy(SHOP);
    const hero = photo('shop-hero');

    return (
        <div
            className={cn(
                'rounded-[2.5em] p-[0.45em] shadow-[0_0.1em_0.3em_rgb(0_0_0/0.06),0_1.8em_3.2em_-1.2em_rgb(0_0_0/0.3)] ring-1 ring-black/5 dark:shadow-none dark:ring-white/10',
                PHONE_BEZEL,
            )}
        >
            <div className="relative h-[32em] overflow-hidden rounded-[2.1em] bg-background">
                <span className={cn('absolute top-[0.7em] left-1/2 z-10 h-[1.35em] w-[4.6em] -translate-x-1/2 rounded-full', PHONE_BEZEL)} />
                <PhoneWireframe />
                <div data-lb="phone-design" data-lb-in="" className="flex h-full flex-col pt-[2.9em]">
                    <div className="flex items-center justify-between px-[1.1em]">
                        <span className="flex items-center gap-[0.5em]">
                            <span className="size-[0.9em] bg-foreground" />
                            <span className="text-[1.05em] font-semibold tracking-tight">{shop.brand}</span>
                        </span>
                        <Menu aria-hidden="true" className="size-[1.4em]" strokeWidth={1.75} />
                    </div>
                    <img
                        src={hero.src}
                        srcSet={hero.srcSet}
                        sizes="170px"
                        width={hero.width}
                        height={hero.height}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        data-lb-phone-photo=""
                        className="mx-[0.9em] mt-[0.9em] aspect-[4/3] w-[calc(100%-1.8em)] rounded-[0.6em] object-cover object-[64%_50%]"
                    />
                    <span className="mt-[1em] px-[1.1em] text-[1.5em] leading-[1.1] font-semibold tracking-[-0.03em]">{shop.title}</span>
                    <span className="mx-[1.1em] mt-[0.9em] flex h-[2.7em] items-center justify-center rounded-[0.5em] bg-foreground text-[1em] font-medium text-background">
                        {shop.cta}
                    </span>
                    <div className="mt-[1.2em] grid grid-cols-2 gap-[0.7em] px-[1.1em]">
                        {shop.products.slice(0, 2).map((product) => {
                            const shot = photo(product.photo);

                            return (
                                <span key={product.name} className="min-w-0">
                                    <img
                                        src={shot.src}
                                        srcSet={shot.srcSet}
                                        sizes="80px"
                                        width={shot.width}
                                        height={shot.height}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        draggable={false}
                                        data-lb-phone-photo=""
                                        style={{ objectPosition: product.position }}
                                        className="aspect-square w-full rounded-[0.5em] object-cover"
                                    />
                                    <span className="mt-[0.5em] block truncate text-[0.85em] font-medium">{product.name}</span>
                                    <span className="block text-[0.85em] text-muted-foreground">{product.price}</span>
                                </span>
                            );
                        })}
                    </div>
                </div>

                <div data-lb="phone-toast" data-lb-in="" className={cn('absolute inset-x-[0.55em] top-[2.6em] z-20 rounded-[1em] p-[0.75em]', FLOAT_SURFACE)}>
                    <span className="flex items-center gap-[0.5em] text-[0.85em] text-muted-foreground">
                        <span className="flex size-[1.5em] items-center justify-center rounded-[0.3em] bg-foreground text-background">
                            <ShoppingBag aria-hidden="true" className="size-[0.95em]" strokeWidth={2} />
                        </span>
                        <span className="flex-1">{shop.brand}</span>
                        <span>{shop.now}</span>
                    </span>
                    <span className="mt-[0.45em] block text-[0.95em] leading-[1.35] font-semibold whitespace-nowrap">{shop.order.title}</span>
                    <span className="block text-[0.9em] leading-[1.35] text-muted-foreground">{shop.order.detail}</span>
                </div>
            </div>
        </div>
    );
}
