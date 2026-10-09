import { Appear } from '@/components/home/bento/bento-tile';
import { PanelMark } from '@/components/home/panel/panel-window';
import { Photo } from '@/components/home/photo';
import { useLiveLoop } from '@/components/motion/use-in-view-loop';
import { photo, type PhotoName } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { NETIZO_BUBBLE, sceneProps, TypingDots, VISITOR_BUBBLE } from './scene-parts';

/** cleared → the question → Netizo typing → the answer (static frame), then it clears and asks again. */
const PHASE_MS = [700, 1100, 1500, 5600] as const;
const ASK = 1;
const THINK = 2;
const ANSWER = 3;

const QUESTION = 'Ile trwa zrobienie strony firmowej?';
/** In line with the FAQ's own answer (a company site takes 4–6 weeks); a no-break space keeps the span together. */
const ANSWER_TEXT = 'Zwykle 4–6 tygodni. Dokładny termin ustalamy po briefie.';

type FaqSceneProps = {
    /** The frame's rendered width where it is placed. */
    sizes: string;
    className?: string;
    /** The chat's photo and lines; the defaults are the home page's (the knitwear shop's owner). */
    photoName?: PhotoName;
    question?: string;
    answer?: string;
};

/**
 * FAQ: the world of the knitwear shop the hero builds (world-wool), its owner asking a
 * question and Netizo typing and answering over it (the partner page passes its own photo and lines). The answer
 * bubble always holds its text (it fades in), so the chat never changes the layout.
 */
export function FaqScene({ sizes, className, photoName = 'world-wool', question = QUESTION, answer = ANSWER_TEXT }: FaqSceneProps) {
    const { ref, step, active } = useLiveLoop<HTMLDivElement>(PHASE_MS, { staticStep: ANSWER, amount: 0.3 });

    return (
        <div ref={ref} {...sceneProps(active)} className={cn('@container relative overflow-hidden border bg-muted', className)}>
            <Photo {...photo(photoName)} alt="" sizes={sizes} className="absolute inset-0" />

            <div className="absolute inset-x-3 bottom-3 ml-auto flex max-w-[20rem] flex-col gap-2 @[24rem]:inset-x-4 @[24rem]:bottom-4">
                <Appear show={step >= ASK} className={cn('max-w-[85%] self-end', VISITOR_BUBBLE)}>
                    {question}
                </Appear>

                <div className="flex items-end gap-2">
                    <Appear show={step >= THINK} from="none">
                        <PanelMark className="size-7 rounded-[4px]" />
                    </Appear>
                    <div className="relative min-w-0 flex-1">
                        <Appear show={step >= ANSWER} className={NETIZO_BUBBLE}>
                            {answer}
                        </Appear>
                        <Appear show={step === THINK} from="none" className={cn('absolute bottom-0 left-0 flex h-[30px] items-center', NETIZO_BUBBLE)}>
                            <TypingDots />
                        </Appear>
                    </div>
                </div>
            </div>
        </div>
    );
}
