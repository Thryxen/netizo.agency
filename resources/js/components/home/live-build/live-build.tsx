import { type CSSProperties, type ReactNode, useRef } from 'react';
import { SceneBackdrop, STAGE_SIZES, WINDOW_SHADOW } from '@/components/home/scenes/scene-parts';
import { Rivet } from '@/components/home/section';
import { cn } from '@/lib/utils';
import { LiveBuildStyles } from './live-build-styles';
import { ShopWindow } from './shop-window';
import { CodeEditor, PhoneMock, PipelineChip, PublishedToast, ScoreCard, StepIndicator } from './stage-parts';
import { useLiveBuild } from './use-live-build';

type LayerProps = {
    /** Placement in the scene (em). */
    className: string;
    /** Depth in em: nearer layers shift more under the tilt. */
    depth?: number;
    /** Timeline key of the layer's entrance (floating layers); omit for layers present from the first frame. */
    track?: string;
    children: ReactNode;
};

/** One depth plane of the scene: positioned in em, pushed forward by `depth`, optionally with its own entrance. */
function Layer({ className, depth = 0, track, children }: LayerProps) {
    return (
        <div data-lb-depth="" style={{ '--lb-z': depth } as CSSProperties} className={cn('absolute', className)}>
            {track ? (
                <div data-lb={track} data-lb-in="">
                    {children}
                </div>
            ) : (
                children
            )}
        </div>
    );
}

/**
 * The hero's stage: a website being built live for a client (a knitwear shop), in the bento's visual language, floating
 * like a product shot on a photo of the shop's own workshop (spec v7: the photo sits still under the tilt and only
 * drifts very slowly). Wireframe → design (photos resolve pixel → sharp) → code → deploy, looping; the scene tilts
 * toward the pointer with its layers at different depths.
 *
 * The markup is the finished composition (SSR, no JS, reduced motion); see live-build-styles for the first-frame gate
 * and use-live-build for the clock. Decorative: hidden from assistive tech, nothing inside is focusable.
 */
export function LiveBuild({ className }: { className?: string }) {
    const rootRef = useRef<HTMLDivElement>(null);

    useLiveBuild(rootRef);

    return (
        <div aria-hidden="true" className={cn('relative', className)}>
            <LiveBuildStyles />
            <div ref={rootRef} data-lb-root="" className="@container relative h-full overflow-hidden select-none">
                <SceneBackdrop name="backdrop-workshop" eager sizes={STAGE_SIZES} imgClassName="object-[50%_45%]" />
                <div data-lb-viewport="" className="relative flex h-full items-center justify-center py-[2.5em] lg:py-[1.5em]">
                    <div data-lb-scene="" className="relative h-[62em] w-[60em] shrink-0 sm:w-[72em]">
                        <Layer className="top-[5em] left-0 w-[58em]">
                            <div className={WINDOW_SHADOW}>
                                <ShopWindow />
                            </div>
                        </Layer>
                        <Layer className="top-0 left-0">
                            <StepIndicator />
                        </Layer>
                        <Layer className="top-[46.2em] left-[24.5em] w-[34em] sm:left-[23.5em]" depth={7} track="editor">
                            <CodeEditor />
                        </Layer>
                        <Layer className="top-[48.3em] left-[1.6em]" depth={10} track="deploy">
                            <PipelineChip />
                        </Layer>
                        <Layer className="top-[53.6em] left-[3.4em]" depth={12} track="published">
                            <PublishedToast />
                        </Layer>
                        <Layer className="top-[12.6em] left-[54em] hidden w-[16em] sm:block" depth={9} track="phone">
                            <PhoneMock />
                        </Layer>
                        <Layer className="top-[2.6em] right-[3.2em]" depth={13} track="score">
                            <ScoreCard />
                        </Layer>
                    </div>
                </div>
            </div>
            <Rivet side="left" className="lg:hidden" />
            <Rivet side="right" className="lg:hidden" />
            <Rivet side="left" edge="bottom" className="md:hidden lg:block" />
        </div>
    );
}
