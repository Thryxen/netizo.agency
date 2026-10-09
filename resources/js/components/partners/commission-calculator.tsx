import { cubicBezier } from 'motion/react';
import { Plus, X } from 'lucide-react';
import { type CSSProperties, type RefObject, useEffect, useRef, useState } from 'react';
import { bleedClassName, gutterClassName, Rivet, Section, SectionHeading } from '@/components/home/section';
import { motionTokens, useCanAnimate, useEntrance } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { commission, formatPln, INITIAL_BASKET, MAX_FIRMS, PROJECT_PRESETS, type ProjectPreset } from './partner-data';

type BasketItem = { key: number; preset: ProjectPreset; added: boolean };

const presetById = (id: string): ProjectPreset => PROJECT_PRESETS.find((preset) => preset.id === id) ?? PROJECT_PRESETS[0];

const MAX_VALUE = Math.max(...PROJECT_PRESETS.map((preset) => preset.value));

const easeOutExpo = cubicBezier(...motionTokens.ease);

/** "1 firma", "3 firmy", "5 firm", "22 firmy". */
function firmsLabel(count: number): string {
    const lastDigit = count % 10;
    const lastTwo = count % 100;

    if (count === 1) {
        return '1 firma';
    }

    return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? `${count} firmy` : `${count} firm`;
}

/**
 * Columns grow up from the baseline (scaleY) and their 15% cap drops in after: all of them, one after another, the
 * first time the chart is in view, and each new one as it is added. Before that first view the columns wait flat
 * under the `html.js` gate; SSR, no JS and reduced motion show the chart as it is.
 */
const CALCULATOR_CSS = `
@keyframes calc-bar-in { from { transform: scaleY(0); } }
@keyframes calc-fade-in { from { opacity: 0; transform: translateY(-0.5rem); } }
[data-calc-bar] { transform-origin: bottom; }
@media screen and (prefers-reduced-motion: no-preference) {
    .js [data-calc-chart]:not([data-revealed]) [data-calc-bar] { transform: scaleY(0); }
    .js [data-calc-chart]:not([data-revealed]) [data-calc-fade] { opacity: 0; }
    [data-calc-chart][data-revealed='entering'] [data-calc-column]:not([data-added]) [data-calc-bar],
    [data-calc-column][data-added] [data-calc-bar] {
        animation: calc-bar-in 0.7s var(--ease-expo-out) backwards;
        animation-delay: calc(var(--column-index, 0) * 70ms);
    }
    [data-calc-chart][data-revealed='entering'] [data-calc-column]:not([data-added]) [data-calc-fade],
    [data-calc-column][data-added] [data-calc-fade] {
        animation: calc-fade-in 0.45s var(--ease-expo-out) backwards;
        animation-delay: calc(var(--column-index, 0) * 70ms + 0.35s);
    }
}
`;

/**
 * Tween the shown total to `value` (0.6 s, expo-out) after it changes; the first value and reduced motion show at
 * once. Writes the element's text node in place (React keeps owning it), so the page doesn't re-render every frame.
 */
function useTweenedText(ref: RefObject<HTMLElement | null>, value: number, format: (value: number) => string): void {
    const shownRef = useRef(value);
    const canAnimate = useCanAnimate();

    useEffect(() => {
        const node = ref.current?.firstChild;
        const from = shownRef.current;

        if (!(node instanceof Text) || from === value) {
            return;
        }

        if (!canAnimate()) {
            shownRef.current = value;

            return;
        }

        // React has just written the final value; start from where the number was instead.
        node.nodeValue = format(from);

        let frame = 0;
        let startedAt: number | null = null;

        const tick = (now: number): void => {
            startedAt ??= now;

            const progress = Math.min(1, (now - startedAt) / 600);

            shownRef.current = from + (value - from) * easeOutExpo(progress);
            node.nodeValue = format(shownRef.current);

            if (progress < 1) {
                frame = window.requestAnimationFrame(tick);
            }
        };

        frame = window.requestAnimationFrame(tick);

        return () => window.cancelAnimationFrame(frame);
    }, [ref, value, format, canAnimate]);
}

/**
 * Kalkulator (#kalkulator): add the firms you could refer, one project each; every firm is a column as tall as its
 * order with the partner's 15% as its filled cap, and the total commission counts to its new value. Clicking a
 * column removes it. Typical quotes come from the home page's price ranges.
 */
export function CommissionCalculator() {
    const [items, setItems] = useState<BasketItem[]>(() => INITIAL_BASKET.map((id, index) => ({ key: index, preset: presetById(id), added: false })));
    const nextKeyRef = useRef(INITIAL_BASKET.length);
    const chartRef = useRef<HTMLDivElement>(null);
    const totalRef = useRef<HTMLSpanElement>(null);
    const entrance = useEntrance(chartRef, { amount: 0.5 });

    const orders = items.reduce((sum, item) => sum + item.preset.value, 0);
    const total = commission(orders);
    const full = items.length >= MAX_FIRMS;
    // Each column's commission sits above it while the columns are wide enough for it.
    const labelClassName = items.length <= 6 ? '' : items.length <= 9 ? 'max-sm:hidden' : 'hidden';

    useTweenedText(totalRef, total, formatPln);

    const add = (preset: ProjectPreset): void => {
        if (full) {
            return;
        }

        const key = nextKeyRef.current++;

        setItems((current) => [...current, { key, preset, added: true }]);
    };

    const remove = (key: number): void => setItems((current) => current.filter((item) => item.key !== key));

    return (
        <Section id="kalkulator" labelledBy="kalkulator-heading" containerClassName="pb-0 md:pb-0">
            <style>{CALCULATOR_CSS}</style>
            <SectionHeading
                id="kalkulator-heading"
                title="Policz swoją prowizję"
                lead="Dodaj firmy, które możesz nam polecić. Kwoty to typowe wyceny z naszych realizacji, ostateczna cena zależy od zakresu projektu."
            />

            <div className={cn('relative grid gap-px border-t border-border bg-border lg:grid-cols-12', bleedClassName)}>
                <Rivet side="left" />
                <Rivet side="right" />

                <div className={cn('bg-background py-8 md:py-10 lg:col-span-5', gutterClassName)}>
                    <h3 id="calculator-add-heading" className="text-sm font-medium">
                        Dodaj poleconą firmę
                    </h3>
                    <ul aria-labelledby="calculator-add-heading" className="mt-4 grid border-t border-border">
                        {PROJECT_PRESETS.map((preset) => (
                            <li key={preset.id} className="border-b border-border">
                                <button
                                    type="button"
                                    disabled={full}
                                    aria-label={`Dodaj: ${preset.label}, ${formatPln(preset.value)}`}
                                    onClick={() => add(preset)}
                                    className="group flex min-h-14 w-full items-center gap-3 py-3 text-left transition-colors outline-none hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50 sm:-mx-2 sm:w-[calc(100%+1rem)] sm:px-2"
                                >
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-input transition-colors group-hover:border-foreground group-disabled:group-hover:border-input">
                                        <Plus aria-hidden="true" className="size-4" />
                                    </span>
                                    <span className="flex-1 font-medium">{preset.label}</span>
                                    <span className="text-sm text-muted-foreground tabular-nums">{formatPln(preset.value)}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2">
                        <p className="text-sm text-muted-foreground">
                            {full ? 'To maksimum kalkulatora. W programie limitu nie ma.' : 'Kliknij słupek na wykresie, żeby go usunąć.'}
                        </p>
                        {items.length > 0 && (
                            <Button type="button" variant="ghost" size="sm" className="-mr-2 max-md:h-11" onClick={() => setItems([])}>
                                Wyczyść
                            </Button>
                        )}
                    </div>
                </div>

                <div className={cn('flex flex-col bg-background py-8 md:py-10 lg:col-span-7', gutterClassName)}>
                    <div
                        ref={chartRef}
                        data-calc-chart=""
                        data-revealed={entrance === 'pending' ? undefined : entrance}
                        className="relative flex h-60 items-end gap-1.5 border-b border-foreground pt-7 sm:h-72 sm:gap-2.5"
                    >
                        {items.length === 0 && (
                            <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
                                Dodaj pierwszą firmę, żeby zobaczyć swoją prowizję.
                            </p>
                        )}
                        {items.map((item, index) => (
                            <button
                                key={item.key}
                                type="button"
                                data-calc-column=""
                                data-added={item.added ? '' : undefined}
                                aria-label={`Usuń: ${item.preset.label}, ${formatPln(item.preset.value)}`}
                                title={`${item.preset.label}, ${formatPln(item.preset.value)}`}
                                onClick={() => remove(item.key)}
                                style={{ height: `${(item.preset.value / MAX_VALUE) * 100}%`, '--column-index': item.added ? 0 : index } as CSSProperties}
                                className="group relative flex max-w-14 min-w-0 flex-1 rounded-t-[4px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <span
                                    data-calc-fade=""
                                    aria-hidden="true"
                                    className={cn('absolute -inset-x-4 bottom-full mb-1.5 text-center text-[11px] font-medium whitespace-nowrap tabular-nums', labelClassName)}
                                >
                                    {formatPln(commission(item.preset.value))}
                                </span>
                                <span data-calc-bar="" className="flex size-full flex-col">
                                    <span data-calc-fade="" className="block h-[15%] min-h-1.5 rounded-t-[4px] bg-foreground" />
                                    <span className="flex flex-1 items-start justify-center border-x border-foreground/15 bg-foreground/[0.06] pt-2 transition-colors group-hover:bg-foreground/[0.12] dark:border-foreground/20 dark:bg-foreground/10">
                                        <X aria-hidden="true" className="size-3.5 opacity-0 transition-opacity group-hover:opacity-60 group-focus-visible:opacity-60" />
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">Każdy słupek to jedno zamówienie. Wypełniona część to Twoje 15%.</p>

                    <div className="mt-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-t border-border pt-6 lg:mt-auto">
                        <p className="max-w-[28ch] text-pretty text-muted-foreground">
                            {items.length === 0 ? 'Brak poleconych firm.' : `${firmsLabel(items.length)}, zamówienia za ${formatPln(orders)} netto.`}
                        </p>
                        <p className="flex flex-col items-start gap-1 sm:items-end">
                            <span className="text-sm text-muted-foreground">Twoja prowizja</span>
                            <output aria-live="polite" className="text-[clamp(2.5rem,6vw,3.75rem)] leading-none font-semibold tracking-[-0.04em] tabular-nums">
                                <span className="sr-only">{formatPln(total)}</span>
                                <span ref={totalRef} aria-hidden="true">
                                    {formatPln(total)}
                                </span>
                            </output>
                        </p>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-pretty text-muted-foreground">
                        Do tego 15% od kolejnych zamówień tych firm przez 12 miesięcy, na przykład za rozbudowę albo opiekę techniczną.
                    </p>
                </div>
            </div>
        </Section>
    );
}
