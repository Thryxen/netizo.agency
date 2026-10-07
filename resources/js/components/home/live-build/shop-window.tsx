import { Lock, ShoppingBag } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SHOP_BRAND, SHOP_CTA, SHOP_HEADLINE, SHOP_LEAD, SHOP_NAV, SHOP_PRODUCTS, SHOP_URL } from './shop-data';
import { StagePhoto } from './stage-photo';

/** Wireframe vocabulary (act 1): hairline dashed slots and quiet bars. Hidden in the finished page. */
const WF_SLOT = 'pointer-events-none absolute inset-0 rounded-[0.5em] border border-dashed border-foreground/30 bg-foreground/[0.025] opacity-0';
const WF_BAR = 'pointer-events-none absolute left-0 origin-left rounded-full bg-foreground/12 opacity-0';
/** The rectangle being dragged out by the cursor: a solid selection, scaled from its top-left corner. */
const WF_MARQUEE = 'pointer-events-none absolute inset-0 origin-top-left border border-foreground/60 bg-foreground/[0.05] opacity-0';

/** Diagonal cross: the classic "image goes here" mark inside a wireframe slot. */
export function SlotCross() {
    return (
        <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0 0L100 100M100 0L0 100" vectorEffect="non-scaling-stroke" strokeWidth={1} className="stroke-foreground/15" />
        </svg>
    );
}

/** A photo slot of the shop: wireframe (+ marquee for the dragged ones) under the photo. */
function PhotoSlot({ name, drawn = false, children, className }: { name: string; drawn?: boolean; children: ReactNode; className?: string }) {
    return (
        <div data-lb-target={name} className={cn('relative', className)}>
            <span data-lb={`wf-${name}`} className={WF_SLOT}>
                <SlotCross />
            </span>
            {drawn && <span data-lb={`wf-${name}-draw`} data-lb-marquee="" className={WF_MARQUEE} />}
            {children}
        </div>
    );
}

/**
 * The browser window the shop is built in: chrome with the address bar, then the page (nav, hero, products), with the
 * act-1 wireframe laid over the same slots, the code-link highlights, the cursor and the wipe panel.
 */
export function ShopWindow() {
    return (
        <div className="flex flex-col overflow-hidden rounded-[0.9em] border bg-background">
            <div className="flex h-[3.4em] shrink-0 items-center gap-[1.4em] border-b bg-muted/60 px-[1.3em]">
                <span className="flex shrink-0 items-center gap-[0.5em]">
                    <span className="size-[0.7em] rounded-full bg-foreground/20" />
                    <span className="size-[0.7em] rounded-full bg-foreground/20" />
                    <span className="size-[0.7em] rounded-full bg-foreground/20" />
                </span>
                <span className="flex h-[2.2em] w-[24em] items-center gap-[0.6em] rounded-[0.45em] border bg-background px-[0.8em]">
                    <Lock aria-hidden="true" className="size-[1em] shrink-0 text-muted-foreground" strokeWidth={2} />
                    <span className="relative overflow-hidden font-mono text-[1.1em] leading-[1.4] whitespace-pre">
                        <span data-lb-url="" data-lb-in="">
                            {SHOP_URL}
                        </span>
                        <span data-lb-cover="" data-lb-url-cover="" className="absolute inset-y-0 left-0 w-full bg-background">
                            <span className="absolute inset-y-[0.12em] left-0 w-[0.1em] bg-foreground/70" />
                        </span>
                    </span>
                </span>
            </div>

            <div className="relative overflow-hidden pb-[1.7em]">
                <ShopNav />
                <ShopHero />
                <ShopProducts />
                <ShopCursor />
                {/* Wipe: sweeps the page clean before the next build (hidden in the finished page). */}
                <span data-lb="wipe" className="pointer-events-none absolute inset-0 z-30 bg-background opacity-0">
                    <span data-lb="wipe-edge" className="absolute inset-y-0 right-0 w-px bg-foreground/50" />
                </span>
            </div>
        </div>
    );
}

function ShopNav() {
    return (
        <div className="relative h-[4.4em] border-b">
            <div className="absolute inset-0 flex items-center justify-between px-[2.4em]">
                <span data-lb="wf-logo" className="flex items-center gap-[0.7em] opacity-0">
                    <span className="size-[1.2em] border border-dashed border-foreground/35" />
                    <span className="h-[0.8em] w-[7em] rounded-full bg-foreground/12" />
                </span>
                <span data-lb="wf-links" className="flex origin-left items-center gap-[1.6em] opacity-0">
                    <span className="h-[0.6em] w-[3.4em] rounded-full bg-foreground/12" />
                    <span className="h-[0.6em] w-[3.4em] rounded-full bg-foreground/12" />
                    <span className="h-[0.6em] w-[4.4em] rounded-full bg-foreground/12" />
                </span>
                <span data-lb="wf-cart" className="size-[1.6em] rounded-[0.3em] border border-dashed border-foreground/35 opacity-0" />
            </div>
            <div data-lb="nav" data-lb-in="" className="absolute inset-0 flex items-center justify-between px-[2.4em]">
                <span className="flex items-center gap-[0.7em]">
                    <span className="size-[1.2em] bg-foreground" />
                    <span className="text-[1.3em] font-semibold tracking-tight">{SHOP_BRAND}</span>
                </span>
                <span className="flex items-center gap-[1.8em] text-[1.1em] text-muted-foreground">
                    {SHOP_NAV.map((item) => (
                        <span key={item}>{item}</span>
                    ))}
                </span>
                <span className="relative">
                    <ShoppingBag aria-hidden="true" className="size-[1.6em]" strokeWidth={1.6} />
                    <span className="absolute -top-[0.35em] -right-[0.45em] flex size-[1.1em] items-center justify-center bg-foreground text-[0.75em] font-semibold text-background">
                        2
                    </span>
                </span>
            </div>
        </div>
    );
}

/** Masked line (descenders and the ogonek in "ę" stay unclipped), as in the page's own H1. */
const LINE_MASK = '-mt-[0.1em] -mb-[0.16em] block overflow-hidden pt-[0.1em] pb-[0.16em]';
const HEADLINE_BARS = ['w-[94%]', 'w-[80%]', 'w-[44%]'];

function ShopHero() {
    return (
        <div className="relative grid grid-cols-[1fr_24em] gap-[2.4em] px-[2.4em] pt-[2.2em]">
            <div className="flex min-w-0 flex-col justify-center">
                <span className="block text-[2.55em] leading-[1.06] font-semibold tracking-[-0.035em]">
                    {SHOP_HEADLINE.map((line, index) => (
                        <span key={line} className="relative block">
                            <span data-lb={`wf-head-${index}`} className={cn(WF_BAR, 'top-[0.24em] h-[0.6em] rounded-[0.12em]', HEADLINE_BARS[index])} />
                            <span className={LINE_MASK}>
                                <span data-lb={`head-${index}`} data-lb-in="" className="block">
                                    {line}
                                </span>
                            </span>
                        </span>
                    ))}
                </span>
                <span className="relative mt-[1.1em] block">
                    <span data-lb="wf-lead" className={cn(WF_BAR, 'top-[0.45em] h-[0.65em] w-[78%]')} />
                    <span data-lb="lead" data-lb-in="" className="block text-[1.15em] leading-[1.45] text-muted-foreground">
                        {SHOP_LEAD}
                    </span>
                </span>
                <span data-lb-target="cta" className="relative mt-[1.7em] block w-fit">
                    <span data-lb="wf-cta" className="pointer-events-none absolute inset-0 rounded-[0.45em] border border-dashed border-foreground/35 opacity-0" />
                    <span
                        data-lb="cta"
                        data-lb-in=""
                        className="flex h-[2.9em] items-center rounded-[0.45em] bg-foreground px-[1.4em] text-[1.1em] font-medium text-background"
                    >
                        {SHOP_CTA}
                    </span>
                </span>
            </div>

            <PhotoSlot name="hero" drawn className="h-[14.6em]">
                <StagePhoto
                    name="hero"
                    photo="shop-hero"
                    sizes="(min-width: 640px) 270px, 40vw"
                    position="68% 50%"
                    className="absolute inset-0 rounded-[0.5em]"
                />
            </PhotoSlot>

            <CodeHighlight name="hero" label="<Hero />" className="inset-x-[1.4em] top-[1.3em] -bottom-[0.9em]" />
        </div>
    );
}

function ShopProducts() {
    return (
        <div className="relative grid grid-cols-3 gap-[1.4em] px-[2.4em] pt-[2.3em]">
            {SHOP_PRODUCTS.map((product, index) => (
                <div key={product.name} className="min-w-0">
                    <PhotoSlot name={`card-${index}`} drawn={index === 0} className="aspect-[16/10]">
                        <StagePhoto
                            name={`card-${index}`}
                            photo={product.photo}
                            sizes="(min-width: 640px) 190px, 28vw"
                            position={product.position}
                            className="absolute inset-0 rounded-[0.5em]"
                        />
                    </PhotoSlot>
                    <div className="relative mt-[0.8em]">
                        <span data-lb={`wf-caption-${index}`} className={cn(WF_BAR, 'top-[0.4em] h-[0.7em] w-[64%]')} />
                        <div data-lb={`caption-${index}`} data-lb-in="" className="flex items-baseline justify-between gap-[0.6em] text-[1.15em] leading-[1.45]">
                            <span className="truncate font-medium">{product.name}</span>
                            <span className="shrink-0 text-muted-foreground tabular-nums">{product.price}</span>
                        </div>
                    </div>
                </div>
            ))}

            <CodeHighlight name="products" label="<ProductGrid />" className="inset-x-[1.4em] top-[1.4em] -bottom-[0.6em]" />
        </div>
    );
}

/** While the editor types a component, its section of the page is outlined, inspector style. Hidden when finished. */
function CodeHighlight({ name, label, className }: { name: string; label: string; className?: string }) {
    return (
        <span data-lb={`hl-${name}`} className={cn('pointer-events-none absolute z-10 rounded-[0.5em] border border-foreground/70 opacity-0', className)}>
            <span className="absolute -top-[1.75em] -left-px rounded-t-[0.35em] bg-foreground px-[0.6em] py-[0.25em] font-mono text-[0.95em] leading-[1.4] text-background">
                {label}
            </span>
        </span>
    );
}

/** The designer's pointer in act 1: drags out slots (with a size readout), then clicks the button. */
function ShopCursor() {
    return (
        <span data-lb="cursor" className="pointer-events-none absolute top-0 left-0 z-20 opacity-0">
            <span data-lb="cursor-ripple" className="absolute top-0 left-0 size-[3.2em] -translate-x-1/2 -translate-y-1/2 opacity-0">
                <span data-lb="cursor-ripple-ring" className="block size-full rounded-full border border-foreground/60" />
            </span>
            <span data-lb="cursor-arrow" className="relative block origin-top-left">
                <svg viewBox="0 0 16 20" className="-mt-[0.15em] -ml-[0.15em] block h-[2em] w-[1.6em] fill-foreground stroke-background" strokeWidth={1.25} strokeLinejoin="round">
                    <path d="M1.5 1.5v14.6l3.8-3.5 2.6 6.1 2.6-1.1-2.6-6h5.1z" />
                </svg>
            </span>
            <span
                data-lb="cursor-badge"
                className="absolute top-[2.3em] left-[1.3em] rounded-[0.3em] bg-foreground px-[0.5em] py-[0.15em] font-mono text-[0.95em] leading-[1.4] whitespace-nowrap text-background tabular-nums opacity-0"
            >
                <span data-lb-badge-text="">0 × 0</span>
            </span>
        </span>
    );
}
