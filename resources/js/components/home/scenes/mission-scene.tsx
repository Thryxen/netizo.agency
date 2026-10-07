import { Check, FileText } from 'lucide-react';
import { PixelatedImage } from '@/components/motion/pixelated-image';
import { photo } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { SceneChip, sceneProps, useSceneArrival } from './scene-parts';

/** The chip slides in this long after the scene is first seen; its box ticks once it has landed. */
const ARRIVE_MS = 500;

/**
 * Misja: the workshop wall of wireframes and flows (mission-workshop, pixel → sharp on first view) with the outcome the
 * quote is about: the system's architecture, approved. The chip arrives once on first view and its box ticks, then it
 * stays (no status loop: the Proces relay already shows a document going through approval).
 */
export function MissionScene({ className }: { className?: string }) {
    const { ref, shown, active } = useSceneArrival<HTMLDivElement>(ARRIVE_MS, { amount: 0.3 });

    return (
        <div ref={ref} {...sceneProps(active)} className={cn('relative overflow-hidden border bg-muted', className)}>
            <PixelatedImage
                {...photo('mission-workshop')}
                sizes="(min-width: 1248px) 625px, (min-width: 1024px) 50vw, calc(100vw - 3rem)"
                alt=""
                className="absolute inset-0"
            />
            <SceneChip
                show={shown}
                icon={FileText}
                title="Architektura systemu"
                detail="Zatwierdzona przed kodowaniem"
                trailing={
                    <span
                        data-state={shown ? 'done' : 'pending'}
                        className="flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-dashed border-foreground/40 transition-colors duration-300 data-[state=done]:border-solid data-[state=done]:border-foreground data-[state=done]:bg-foreground data-[state=done]:delay-500"
                    >
                        <Check
                            aria-hidden="true"
                            data-show={shown}
                            className="size-3.5 text-background transition-[opacity,scale] duration-300 ease-expo-out data-[show=false]:scale-50 data-[show=false]:opacity-0 data-[show=true]:delay-600"
                            strokeWidth={2.75}
                        />
                    </span>
                }
                className="absolute bottom-3 left-3 w-[min(19rem,calc(100%-1.5rem))] sm:bottom-5 sm:left-5"
            />
        </div>
    );
}
