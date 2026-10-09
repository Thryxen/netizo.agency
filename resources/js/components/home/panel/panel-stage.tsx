import { Download, type LucideIcon, MessageSquare, ReceiptText } from 'lucide-react';
import type { ReactNode } from 'react';
import { SceneBackdrop, STAGE_SIZES, WINDOW_SHADOW } from '@/components/home/scenes/scene-parts';
import { useInViewLoop } from '@/components/motion/use-in-view-loop';
import { useCopy } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { BoardScene } from './board-scene';
import { PANEL_MODES, PANEL_TEXT, type PanelMode } from './panel-data';
import { PanelStyles } from './panel-styles';
import { BOARD, BOARD_PHASE_MS, TIME, TIME_PHASE_MS, useSceneLoop } from './panel-timeline';
import { PanelWindow } from './panel-window';
import { TimeScene } from './time-scene';

/** Floating layers over the window, as in the hero: a hairline plus a soft, short shadow in light mode. */
const FLOAT_SURFACE =
    'border bg-background shadow-[0_0.1em_0.25em_rgb(0_0_0/0.05),0_1.4em_2.6em_-1em_rgb(0_0_0/0.2)] dark:bg-[oklch(0.205_0_0)] dark:shadow-none';

/**
 * The live mock of the client panel: the window floating on a photo of a bright office corner (spec v7, like the
 * hero's build on its workshop), the active mode's page looping while it is in view (Tablica or Czas pracy), its
 * notification floating over the window's edge, and the "Dane przykładowe." caption on a solid label.
 * Switching modes crossfades the page (≤ 300 ms) and slides the sidebar's highlight; the newly shown page starts
 * its loop from the top. Static (SSR, no JS, offscreen before first view, reduced motion): the finished frame.
 */
export function PanelStage({ mode, className }: { mode: PanelMode; className?: string }) {
    const { ref, active: live, reducedMotion } = useInViewLoop<HTMLElement>({ amount: 0.3 });
    const boardStep = useSceneLoop(BOARD_PHASE_MS, { live, selected: mode === 'project', reducedMotion, holdStep: BOARD.hold, resetStep: BOARD.reset });
    const timeStep = useSceneLoop(TIME_PHASE_MS, { live, selected: mode === 'retainer', reducedMotion, holdStep: TIME.hold, resetStep: TIME.reset });
    const boardToast = mode === 'project' && boardStep === BOARD.hold;
    const timeToast = mode === 'retainer' && timeStep === TIME.hold;
    const text = useCopy(PANEL_TEXT);
    const label = useCopy(PANEL_MODES).find(({ value }) => value === mode)?.mockLabel;

    return (
        <figure ref={ref} data-panel-stage="" data-panel-live={live ? '' : undefined} className={cn('@container/panel relative overflow-hidden select-none', className)}>
            <PanelStyles />
            <SceneBackdrop name="backdrop-office" sizes={STAGE_SIZES} imgClassName="object-[50%_40%]" />

            <div data-panel-viewport="" className="relative flex h-full flex-col justify-center">
                <div role="img" aria-label={label} className="relative">
                    <div className={WINDOW_SHADOW}>
                        <PanelWindow mode={mode} notify={boardToast || timeToast}>
                            <div className="grid h-full">
                                <Scene show={mode === 'project'}>
                                    <BoardScene step={boardStep} />
                                </Scene>
                                <Scene show={mode === 'retainer'}>
                                    <TimeScene step={timeStep} live={live && mode === 'retainer'} />
                                </Scene>
                            </div>
                        </PanelWindow>
                    </div>

                    <PanelToast show={boardToast} icon={MessageSquare} title={text.boardToast.title} body={text.boardToast.body} now={text.now} />
                    <PanelToast
                        show={timeToast}
                        icon={ReceiptText}
                        title={text.settlementToast.title}
                        body={text.settlementToast.body}
                        now={text.now}
                        action={
                            <span className="flex h-[2.3em] shrink-0 items-center gap-[0.45em] rounded-[0.45em] border bg-background px-[0.8em] text-[0.95em] font-medium whitespace-nowrap dark:bg-input/12">
                                <Download aria-hidden="true" className="size-[1.05em]" strokeWidth={2} />
                                {text.downloadInvoice}
                            </span>
                        }
                    />
                </div>

                <figcaption className="mt-[2.9em] w-fit rounded-[3px] border bg-background px-2 py-1 text-xs leading-none text-muted-foreground">
                    {text.sampleData}
                </figcaption>
            </div>
        </figure>
    );
}

/** One page of the window; pages share a grid cell, so switching never changes the window's size. */
function Scene({ show, children }: { show: boolean; children: ReactNode }) {
    return (
        <div
            data-show={show}
            className="relative col-start-1 row-start-1 min-w-0 transition-[opacity,translate,visibility] duration-300 ease-expo-out data-[show=false]:invisible data-[show=false]:translate-y-[0.6em] data-[show=false]:opacity-0"
        >
            {children}
        </div>
    );
}

type PanelToastProps = {
    show: boolean;
    icon: LucideIcon;
    title: string;
    body: string;
    /** The time stamp ("teraz"). */
    now: string;
    action?: ReactNode;
};

/** A notification sliding in over the window's lower-right edge (the panel shows it in-app and as a push). */
function PanelToast({ show, icon: Icon, title, body, now, action }: PanelToastProps) {
    return (
        <div
            data-show={show}
            style={{ right: 'var(--panel-toast-x)' }}
            className={cn(
                'absolute -bottom-[1.8em] z-10 flex max-w-[calc(100%-1em)] flex-wrap items-center gap-x-[0.8em] gap-y-[0.6em] rounded-[0.8em] p-[0.8em] pr-[1em]',
                FLOAT_SURFACE,
                'transition-[opacity,translate] duration-500 ease-expo-out data-[show=false]:translate-y-[1.2em] data-[show=false]:opacity-0 data-[show=false]:duration-300',
            )}
        >
            <span className="flex min-w-0 flex-1 items-center gap-[0.8em]">
                <span className="flex size-[2.5em] shrink-0 items-center justify-center rounded-[0.5em] bg-foreground text-background">
                    <Icon aria-hidden="true" className="size-[1.25em]" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 leading-[1.35]">
                    <span className="flex items-baseline gap-[0.8em]">
                        <span className="text-[1.05em] font-medium whitespace-nowrap">{title}</span>
                        <span className="ml-auto text-[0.85em] text-muted-foreground">{now}</span>
                    </span>
                    <span className="block text-[0.98em] whitespace-nowrap text-muted-foreground">{body}</span>
                </span>
            </span>
            {action && <span className="ml-[3.3em] @min-[32.5rem]/panel:ml-0">{action}</span>}
        </div>
    );
}
