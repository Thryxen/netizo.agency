import { Bot, Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useLiveLoop } from '@/components/motion/use-in-view-loop';
import { cn } from '@/lib/utils';
import { Appear, BentoTile, type BentoRivet, BentoTileText, type BentoService, liveVisualProps, tileGutterBottom, tileGutterTop, tileGutterX } from './bento-tile';

/** question → assistant typing → answer word by word → task logged (static frame) → fade out. */
const PHASE_MS = [900, 1000, 1700, 2600, 450] as const;
const THINK = 1;
const ANSWER = 2;
const TASK = 3;
const RESET = 4;

const QUESTION = 'Ile kosztuje wysyłka do Niemiec?';
/** No-break spaces keep "39 zł" and "2–3 dni" together. */
const ANSWER_WORDS = 'Wysyłka kosztuje 39\u00a0zł, dostawa w\u00a02–3\u00a0dni robocze.'.split(' ');
const WORD_MS = 125;

/**
 * AI & Automatyzacja: a support chat. The customer asks, the assistant answers word by word and files the task in
 * the CRM. The answer bubble always holds the full text (words fade in), so typing never changes the layout.
 */
export function AiTile({ service, rivets }: { service: BentoService; rivets?: BentoRivet[] }) {
    const { ref, step, active } = useLiveLoop<HTMLDivElement>(PHASE_MS, { staticStep: TASK });
    const at = (phase: number): boolean => step >= phase && step !== RESET;

    return (
        <BentoTile rivets={rivets}>
            <BentoTileText service={service} className={cn(tileGutterX, tileGutterTop)} />

            <div ref={ref} {...liveVisualProps(active)} className={cn('mt-auto flex flex-col gap-2 pt-7', tileGutterX, tileGutterBottom)}>
                <Appear show={step !== RESET} className="max-w-[88%] self-end rounded-lg rounded-br-[3px] bg-foreground px-3 py-2 text-xs leading-snug text-background">
                    {QUESTION}
                </Appear>

                <div className="flex items-start gap-2">
                    <Appear show={at(THINK)} from="none" className="flex size-6 shrink-0 items-center justify-center rounded-[3px] border">
                        <Bot className="size-3.5" strokeWidth={1.75} />
                    </Appear>
                    <div className="relative min-w-0">
                        <Appear show={at(ANSWER)} className="rounded-lg rounded-tl-[3px] bg-muted px-3 py-2 text-xs leading-snug">
                            {ANSWER_WORDS.map((word, index) => (
                                <span key={index}>
                                    <span
                                        data-show={at(ANSWER)}
                                        style={at(ANSWER) && step === ANSWER ? { transitionDelay: `${index * WORD_MS}ms` } : undefined}
                                        className="transition-opacity duration-150 data-[show=false]:opacity-0"
                                    >
                                        {word}
                                    </span>
                                    {index < ANSWER_WORDS.length - 1 && ' '}
                                </span>
                            ))}
                        </Appear>
                        <Appear
                            show={step === THINK}
                            from="none"
                            data-transient=""
                            className="absolute top-0 left-0 flex h-[30px] items-center gap-1 rounded-lg rounded-tl-[3px] bg-muted px-3"
                        >
                            {[0, 1, 2].map((dot) => (
                                <span
                                    key={dot}
                                    style={{ '--bento-delay': `${dot * 160}ms` } as CSSProperties}
                                    className={cn('size-1 bg-foreground/70', step === THINK && 'vx-bento-blink')}
                                />
                            ))}
                        </Appear>
                    </div>
                </div>

                <Appear show={at(TASK)} className="ml-8 inline-flex w-fit items-center gap-1.5 rounded-[3px] border px-2 py-1 text-[11px] text-muted-foreground">
                    <Check aria-hidden="true" className="size-3 text-foreground" strokeWidth={2.25} />
                    Zadanie dodane do CRM
                </Appear>
            </div>
        </BentoTile>
    );
}
