import { Check, ChevronDown, MessageSquare, Paperclip, Plus, X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { type Locale, useCopy, useLocale } from '@/lib/i18n';
import { photo } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { BOARD_COLUMNS, BOARD_TASKS, type BoardTask, COLUMN_INDEX, type ColumnKey, NEW_TASK, PANEL_TEXT, type Priority, PRIORITY_LEVEL } from './panel-data';
import { PanelMark } from './panel-window';
import { BOARD } from './panel-timeline';

/** Where the new task sits in each phase (before it lands it waits, hidden, in Do zrobienia). */
function newTaskColumn(step: number): ColumnKey {
    if (step === BOARD.progress) {
        return 'doing';
    }

    return step >= BOARD.done ? 'done' : 'todo';
}

const newTaskShown = (step: number): boolean => step >= BOARD.landed && step <= BOARD.hold;

type Point = { x: number; y: number };

/**
 * Pointer targets in em from the scene's top-right corner (x to the left, y down). The header button and the dialog
 * are anchored to that corner, so the same targets hold in every composition.
 */
const CURSOR_AT = {
    rest: { x: 2.5, y: 16 },
    add: { x: 3.9, y: 1.5 },
    idle: { x: 1.2, y: 2.4 },
    priority: { x: 20.4, y: 19.3 },
    submit: { x: 4.8, y: 19.3 },
} satisfies Record<string, Point>;

function cursorAt(step: number): { at: Point; show: boolean; clicking: boolean } {
    switch (step) {
        case BOARD.toAdd:
            return { at: CURSOR_AT.add, show: true, clicking: false };
        case BOARD.clickAdd:
            return { at: CURSOR_AT.add, show: true, clicking: true };
        case BOARD.type:
        case BOARD.paste:
            return { at: CURSOR_AT.idle, show: true, clicking: false };
        case BOARD.toPriority:
            return { at: CURSOR_AT.priority, show: true, clicking: false };
        case BOARD.priority:
            return { at: CURSOR_AT.priority, show: true, clicking: true };
        case BOARD.toSubmit:
            return { at: CURSOR_AT.submit, show: true, clicking: false };
        case BOARD.submit:
            return { at: CURSOR_AT.submit, show: true, clicking: true };
        case BOARD.landed:
            return { at: CURSOR_AT.submit, show: false, clicking: false };
        default:
            return { at: CURSOR_AT.rest, show: false, clicking: false };
    }
}

/**
 * Tablica: the four columns, the cards placed by transform (a card moving pushes the one below it down and lets it
 * back up), the "Dodaj task" dialog and the pointer. A pure function of the loop's phase.
 */
export function BoardScene({ step }: { step: number }) {
    const text = useCopy(PANEL_TEXT);
    const newColumn = newTaskColumn(step);
    const shown = newTaskShown(step);
    const dialogOpen = step >= BOARD.type && step <= BOARD.submit;
    const cursor = cursorAt(step);

    const countIn = (column: ColumnKey): number =>
        BOARD_TASKS.filter((task) => task.column === column).length + (shown && newColumn === column ? 1 : 0);

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-[2.6em] items-center justify-between gap-[1em]">
                <span className="text-[1.45em] leading-none font-semibold tracking-tight">{text.pages.project}</span>
                <span
                    className={cn(
                        'flex h-[2.6em] shrink-0 items-center gap-[0.45em] rounded-[0.45em] bg-foreground px-[0.95em] text-background',
                        step === BOARD.clickAdd && 'nz-panel-press',
                    )}
                >
                    <Plus aria-hidden="true" className="size-[1.1em]" strokeWidth={2.25} />
                    <span className="text-[1.02em] font-medium whitespace-nowrap">{text.addTask}</span>
                </span>
            </div>

            <div className="relative mt-[1.2em] flex min-h-[25.4em] flex-1 flex-col">
                <div data-panel-columns="" className="grid flex-1">
                    {BOARD_COLUMNS.map((column) => (
                        <div key={column.key} className={cn('min-w-0 flex-col', column.key === 'urgent' ? 'hidden @min-[32.5rem]/panel:flex' : 'flex')}>
                            <div className="flex h-[2.3em] items-center gap-[0.55em] px-[0.2em]">
                                <span className={cn('size-[0.55em] shrink-0 rounded-[0.1em]', column.dot)} />
                                <span className="truncate text-[1em] font-medium">{text.columns[column.key]}</span>
                                <span className="ml-auto text-[0.92em] text-muted-foreground tabular-nums">{countIn(column.key)}</span>
                            </div>
                            <div className="flex-1 rounded-[0.6em] bg-muted/70 p-[0.4em] dark:bg-muted/45">
                                {column.key === 'urgent' && (
                                    <span className="flex h-[4.4em] items-center justify-center rounded-[0.5em] border border-dashed border-foreground/15 text-[0.92em] text-muted-foreground">
                                        {text.noTasks}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cards live in one layer over the column bodies, so moving between columns is a transform. */}
                <div className="pointer-events-none absolute inset-x-0 top-[2.3em]">
                    {BOARD_TASKS.map((task) => {
                        const pushedDown = shown && newColumn === task.column;

                        return (
                            <CardSlot key={task.id} column={task.column} slot={pushedDown ? 1 : 0} delayed={!pushedDown}>
                                <TaskCard task={task} done={task.column === 'done'} />
                            </CardSlot>
                        );
                    })}
                    <CardSlot column={newColumn} slot={0}>
                        <div
                            data-show={shown}
                            className={cn(
                                'transition-[opacity,scale] duration-300 ease-expo-out data-[show=false]:scale-[0.96] data-[show=false]:opacity-0',
                                step === BOARD.landed && 'delay-150',
                                step === BOARD.reset && 'duration-200',
                            )}
                        >
                            <TaskCard
                                task={{ ...NEW_TASK, assigned: step >= BOARD.progress && step <= BOARD.hold }}
                                file={text.newTaskFile}
                                done={newColumn === 'done'}
                                className={step === BOARD.landed ? 'nz-panel-land' : undefined}
                            />
                        </div>
                    </CardSlot>
                </div>
            </div>

            <span
                data-show={dialogOpen}
                className="absolute inset-[-1.4em_-1.4em_-1.6em] z-10 bg-background/55 transition-opacity duration-200 data-[show=false]:opacity-0"
            />
            <AddTaskDialog step={step} open={dialogOpen} />

            <span
                data-panel-cursor=""
                data-show={cursor.show}
                style={{ '--x': cursor.at.x, '--y': cursor.at.y } as CSSProperties}
                className="pointer-events-none absolute top-0 right-0 z-30 size-0 data-[show=false]:opacity-0"
            >
                {cursor.clicking && <span className="nz-panel-ripple absolute top-[0.15em] left-[0.15em] size-[3em] rounded-full border border-foreground/60" />}
                <svg
                    viewBox="0 0 16 20"
                    className={cn('absolute -top-[0.15em] -left-[0.15em] block h-[2em] w-[1.6em] origin-top-left fill-foreground stroke-background', cursor.clicking && 'nz-panel-press')}
                    strokeWidth={1.25}
                    strokeLinejoin="round"
                >
                    <path d="M1.5 1.5v14.6l3.8-3.5 2.6 6.1 2.6-1.1-2.6-6h5.1z" />
                </svg>
            </span>
        </div>
    );
}

type CardSlotProps = { column: ColumnKey; slot: number; delayed?: boolean; children: ReactNode };

/** One column wide, positioned by column and slot (styles: [data-panel-card]). */
function CardSlot({ column, slot, delayed = false, children }: CardSlotProps) {
    return (
        <div
            data-panel-card=""
            data-delay={delayed ? '' : undefined}
            style={{ '--col': COLUMN_INDEX[column], '--slot': slot } as CSSProperties}
            className="absolute top-[0.4em] left-0 px-[0.4em]"
        >
            {children}
        </div>
    );
}

type TaskCardProps = {
    task: BoardTask;
    /** The pasted screenshot, shown as an attachment chip. */
    file?: string;
    done?: boolean;
    className?: string;
};

function TaskCard({ task, file, done = false, className }: TaskCardProps) {
    const text = useCopy(PANEL_TEXT);

    return (
        <div
            className={cn(
                'flex h-(--panel-card-h) flex-col rounded-[0.55em] border bg-background px-[0.62em] pt-[0.6em] pb-[0.55em] shadow-[0_0.06em_0.15em_rgb(0_0_0/0.05)] dark:shadow-none',
                className,
            )}
        >
            <div className="flex h-[1.5em] items-center justify-between gap-[0.5em]">
                <span className="flex items-center gap-[0.35em] text-[0.92em] text-muted-foreground tabular-nums">
                    <span
                        data-show={done}
                        className="flex size-[1.05em] items-center justify-center rounded-[0.2em] bg-foreground text-background transition-opacity duration-300 data-[show=false]:hidden"
                    >
                        <Check aria-hidden="true" className="size-[0.8em]" strokeWidth={3} />
                    </span>
                    #{task.id}
                </span>
                <PriorityBadge priority={task.priority} />
            </div>
            <p className="mt-[0.3em] line-clamp-2 text-[1.04em] leading-[1.3] font-medium">{text.tasks[task.id]}</p>
            <div className="mt-auto flex h-[1.8em] items-center justify-between gap-[0.5em]">
                <span className="flex min-w-0 items-center gap-[0.75em] text-[0.88em] text-muted-foreground">
                    {file && (
                        <span className="flex min-w-0 items-center gap-[0.3em] rounded-[0.3em] border px-[0.4em] py-[0.15em] text-foreground/80">
                            <Paperclip aria-hidden="true" className="size-[1em] shrink-0" strokeWidth={2} />
                            <span className="truncate">{file}</span>
                        </span>
                    )}
                    {task.attachments !== undefined && (
                        <span className="flex items-center gap-[0.3em] tabular-nums">
                            <Paperclip aria-hidden="true" className="size-[1em]" strokeWidth={2} />
                            {task.attachments}
                        </span>
                    )}
                    {task.comments !== undefined && (
                        <span className="flex items-center gap-[0.3em] tabular-nums">
                            <MessageSquare aria-hidden="true" className="size-[1em]" strokeWidth={2} />
                            {task.comments}
                        </span>
                    )}
                </span>
                <span
                    data-show={task.assigned === true}
                    className="flex shrink-0 transition-[opacity,scale] delay-300 duration-500 ease-expo-out data-[show=false]:scale-50 data-[show=false]:opacity-0 data-[show=false]:delay-0"
                >
                    <PanelMark className="size-[1.6em] rounded-[0.25em]" />
                </span>
            </div>
        </div>
    );
}

/** Priority as filled bars (urgent: an exclamation bit), monochrome; the label is the panel's own. */
export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
    const level = PRIORITY_LEVEL[priority];
    const text = useCopy(PANEL_TEXT);

    return (
        <span className={cn('flex h-[1.6em] shrink-0 items-center gap-[0.35em] rounded-[0.3em] border px-[0.4em] text-[0.86em] whitespace-nowrap text-foreground/80', className)}>
            <PriorityGlyph level={level} />
            {text.priorities[priority]}
        </span>
    );
}

function PriorityGlyph({ level }: { level: number }) {
    if (level >= 4) {
        return <span className="flex size-[0.85em] items-center justify-center rounded-[0.15em] bg-foreground text-[0.7em] leading-none font-bold text-background">!</span>;
    }

    return (
        <span className="flex h-[0.85em] items-end gap-[0.12em]">
            {[0.4, 0.62, 0.85].map((height, index) => (
                <span key={height} style={{ height: `${height}em` }} className={cn('w-[0.2em] rounded-[0.05em]', index < level ? 'bg-foreground' : 'bg-foreground/20')} />
            ))}
        </span>
    );
}

/** The new task's title, character by character (typed in the dialog), in each language. */
const TITLE_CHARACTERS: Record<Locale, string[]> = {
    pl: [...PANEL_TEXT.pl.tasks[NEW_TASK.id]],
    en: [...PANEL_TEXT.en.tasks[NEW_TASK.id]],
};
const SCREENSHOT = photo('shop-hero');

/**
 * "Dodaj task", anchored under the header button: the title types in, a screenshot pasted from the clipboard
 * becomes an attachment, the priority goes from Normalny to Wysoki, and the pointer submits.
 */
function AddTaskDialog({ step, open }: { step: number; open: boolean }) {
    // The form keeps its content while it closes (landed), and is cleared once out of sight.
    const typing = step === BOARD.type;
    const typed = step >= BOARD.type && step <= BOARD.landed;
    const pasted = step >= BOARD.paste && step <= BOARD.landed;
    const priority: Priority = step >= BOARD.priority && step <= BOARD.landed ? 'high' : 'normal';
    const text = useCopy(PANEL_TEXT);
    const titleCharacters = TITLE_CHARACTERS[useLocale()];

    return (
        <div
            data-show={open}
            className={cn(
                'absolute top-[3.2em] right-0 z-20 w-[28em] origin-top-right rounded-[0.75em] border bg-background p-[1.3em] dark:bg-[oklch(0.19_0_0)]',
                'shadow-[0_0.1em_0.3em_rgb(0_0_0/0.06),0_1.4em_3em_-1em_rgb(0_0_0/0.25)] dark:shadow-none',
                'transition-[opacity,scale] duration-200 ease-expo-out data-[show=false]:scale-[0.97] data-[show=false]:opacity-0',
            )}
        >
            <div className="flex h-[1.8em] items-center justify-between">
                <span className="text-[1.22em] font-semibold tracking-tight">{text.addTask}</span>
                <X aria-hidden="true" className="size-[1.1em] text-muted-foreground" strokeWidth={1.75} />
            </div>

            <div className="relative mt-[1em] flex h-[2.7em] items-center rounded-[0.45em] border border-foreground/40 px-[0.8em] ring-[0.2em] ring-foreground/[0.07]">
                <span
                    data-show={!typed}
                    className="absolute left-[0.75em] text-[1.06em] whitespace-nowrap text-muted-foreground transition-opacity duration-100 data-[show=false]:opacity-0 data-[show=false]:delay-[260ms]"
                >
                    {text.taskPlaceholder}
                </span>
                <span key={typing ? 'typing' : 'still'} data-panel-typing={typing ? '' : undefined} data-show={typed} className="text-[1.06em] whitespace-nowrap data-[show=false]:opacity-0">
                    {titleCharacters.map((character, index) => (
                        <span key={index} style={{ '--i': index } as CSSProperties}>
                            {character}
                        </span>
                    ))}
                </span>
            </div>

            <div className="relative mt-[0.7em] h-[6.2em] rounded-[0.45em] border px-[0.8em] py-[0.65em]">
                <span className="text-[0.98em] text-muted-foreground">{text.descriptionPlaceholder}</span>
                <span
                    data-show={step === BOARD.paste}
                    className="absolute top-[0.55em] right-[0.6em] flex items-center gap-[0.25em] text-[0.82em] text-muted-foreground transition-opacity duration-200 data-[show=false]:opacity-0"
                >
                    <kbd className="rounded-[0.25em] border bg-muted px-[0.4em] py-[0.05em] font-sans text-foreground">Ctrl</kbd>
                    <kbd className="rounded-[0.25em] border bg-muted px-[0.45em] py-[0.05em] font-sans text-foreground">V</kbd>
                </span>
                <span
                    data-show={pasted}
                    className="absolute bottom-[0.6em] left-[0.6em] flex items-center gap-[0.55em] rounded-[0.4em] border bg-background py-[0.25em] pr-[0.7em] pl-[0.25em] transition-[opacity,translate] delay-150 duration-300 ease-expo-out data-[show=false]:translate-y-[0.4em] data-[show=false]:opacity-0 data-[show=false]:delay-0"
                >
                    <img
                        src={SCREENSHOT.src}
                        srcSet={SCREENSHOT.srcSet}
                        sizes="64px"
                        width={SCREENSHOT.width}
                        height={SCREENSHOT.height}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="h-[2.2em] w-[3.3em] rounded-[0.25em] object-cover object-[64%_50%]"
                    />
                    <span className="text-[0.92em] leading-[1.25]">
                        <span className="block font-medium">{text.newTaskFile}</span>
                        <span className="block text-muted-foreground">{text.pasted}</span>
                    </span>
                </span>
            </div>

            <div className="mt-[0.9em] flex h-[2.6em] items-center justify-between gap-[0.8em]">
                <span
                    className={cn(
                        'flex h-full w-[13em] items-center gap-[0.5em] rounded-[0.45em] border px-[0.7em] text-[0.98em]',
                        step === BOARD.priority && 'nz-panel-press',
                    )}
                >
                    <span className="text-muted-foreground">{text.priority}</span>
                    <span className="grid flex-1">
                        {(['normal', 'high'] as const).map((value) => (
                            <span
                                key={value}
                                data-show={value === priority}
                                className="col-start-1 row-start-1 flex items-center gap-[0.4em] font-medium transition-[opacity,translate] duration-200 data-[show=false]:-translate-y-[0.3em] data-[show=false]:opacity-0"
                            >
                                <PriorityGlyph level={PRIORITY_LEVEL[value]} />
                                {text.priorities[value]}
                            </span>
                        ))}
                    </span>
                    <ChevronDown aria-hidden="true" className="size-[1em] text-muted-foreground" strokeWidth={1.75} />
                </span>
                <span
                    className={cn(
                        'flex h-full shrink-0 items-center rounded-[0.45em] bg-foreground px-[1em] text-[1.02em] font-medium whitespace-nowrap text-background',
                        step === BOARD.submit && 'nz-panel-press',
                    )}
                >
                    {text.addTask}
                </span>
            </div>
        </div>
    );
}
