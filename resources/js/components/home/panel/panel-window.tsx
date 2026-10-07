import { Bell, ChevronsUpDown, Lock, MessagesSquare } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { clientPanelUrl } from '@/lib/site';
import { cn } from '@/lib/utils';
import { MODE_PAGE, PANEL_MODES, PANEL_NAV, type PanelMode } from './panel-data';

/** The panel's sidebar surface (shadcn's sidebar tokens: a step off the page in both themes). */
const SIDEBAR_SURFACE = 'bg-[oklch(0.985_0_0)] dark:bg-[oklch(0.18_0_0)]';

/** Sidebar row height + gap, in em (the active highlight slides by this step). */
const NAV_ROW = 2.4;
const NAV_GAP = 0.15;

const PANEL_HOST = clientPanelUrl.replace(/^https?:\/\//, '');

/** The panel's mark: the logo's pixel staircase on an ink square. */
export function PanelMark({ className }: { className?: string }) {
    return (
        <span className={cn('relative block shrink-0 rounded-[0.3em] bg-foreground', className)}>
            <span className="absolute top-[22%] right-[22%] size-[18%] bg-background" />
            <span className="absolute top-[40%] right-[40%] size-[18%] bg-background" />
            <span className="absolute top-[58%] right-[58%] size-[18%] bg-background" />
        </span>
    );
}

type PanelWindowProps = {
    mode: PanelMode;
    /** A notification just arrived (the bell's bit lights). */
    notify: boolean;
    children: ReactNode;
};

/**
 * The client panel in a browser window, as it really looks (shadcn neutral, Geist): address bar with the panel's
 * address, the sidebar (mark, project switcher, navigation, team chat) and a top bar with the page title and the
 * notification bell. `children` is the page content; the active page follows the toggle.
 */
export function PanelWindow({ mode, notify, children }: PanelWindowProps) {
    const page = MODE_PAGE[mode];

    return (
        <div className="relative overflow-hidden rounded-[0.9em] border bg-background">
            <div className="flex h-[3.2em] items-center gap-[1.3em] border-b bg-muted/60 px-[1.2em]">
                <span className="flex shrink-0 items-center gap-[0.5em]">
                    <span className="size-[0.65em] bg-foreground/20" />
                    <span className="size-[0.65em] bg-foreground/20" />
                    <span className="size-[0.65em] bg-foreground/20" />
                </span>
                <span className="flex h-[2.1em] w-full max-w-[24em] min-w-0 items-center gap-[0.6em] rounded-[0.45em] border bg-background px-[0.8em]">
                    <Lock aria-hidden="true" className="size-[0.95em] shrink-0 text-muted-foreground" strokeWidth={2} />
                    <span className="truncate font-mono text-[1.05em] leading-[1.4] text-foreground/80">{PANEL_HOST}</span>
                </span>
            </div>

            <div className="flex">
                <Sidebar activeIndex={page.nav} />

                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex h-[3.3em] items-center gap-[0.9em] border-b px-[1.4em]">
                        {/* Phones (no sidebar): the panel's mark and name stand in for it, so the mock still reads as the panel. */}
                        <span className="flex shrink-0 items-center gap-[0.6em] @min-[32.5rem]/panel:hidden">
                            <PanelMark className="size-[1.6em]" />
                            <span className="text-[1.02em] font-medium whitespace-nowrap">Panel klienta</span>
                        </span>
                        <span className="h-[1.2em] w-px shrink-0 bg-border @min-[32.5rem]/panel:hidden" />
                        <span className="flex min-w-0 items-center gap-[0.5em] text-[1.02em]">
                            <span className="truncate text-muted-foreground">Twoja firma</span>
                            <span className="text-muted-foreground/60">/</span>
                            <span className="grid">
                                {PANEL_MODES.map(({ value }) => (
                                    <span
                                        key={value}
                                        data-show={value === mode}
                                        className="col-start-1 row-start-1 font-medium whitespace-nowrap transition-[opacity,translate] duration-300 ease-expo-out data-[show=false]:translate-y-[0.3em] data-[show=false]:opacity-0"
                                    >
                                        {MODE_PAGE[value].title}
                                    </span>
                                ))}
                            </span>
                        </span>
                        <span className="ml-auto flex shrink-0 items-center gap-[1em]">
                            <span className="relative">
                                <Bell aria-hidden="true" className="size-[1.25em] text-foreground/80" strokeWidth={1.75} />
                                <span
                                    data-show={notify}
                                    className="absolute -top-[0.15em] -right-[0.15em] size-[0.5em] bg-foreground ring-[0.15em] ring-background transition-[opacity,scale] duration-300 data-[show=false]:scale-50 data-[show=false]:opacity-0"
                                />
                            </span>
                            <span className="hidden size-[2em] items-center justify-center rounded-full bg-muted text-[0.85em] font-semibold text-foreground/80 @min-[32.5rem]/panel:flex">
                                JK
                            </span>
                        </span>
                    </div>

                    <div className="relative flex-1 p-[1.4em] pb-[1.6em]">{children}</div>
                </div>
            </div>
        </div>
    );
}

/** Full sidebar from 41.25rem of stage, an icon rail from 32.5rem, none on phones (the top bar's mark stands in). */
function Sidebar({ activeIndex }: { activeIndex: number }) {
    return (
        <div
            className={cn(
                'hidden w-[3.9em] shrink-0 flex-col border-r px-[0.55em] py-[0.8em] @min-[32.5rem]/panel:flex @min-[41.25rem]/panel:w-[12.2em]',
                SIDEBAR_SURFACE,
            )}
        >
            <div className="flex h-[2.6em] items-center gap-[0.7em] px-[0.35em]">
                <PanelMark className="size-[2.1em]" />
                <span className="hidden min-w-0 leading-[1.25] @min-[41.25rem]/panel:block">
                    <span className="block truncate text-[1.06em] font-semibold tracking-tight">Panel klienta</span>
                    <span className="block truncate text-[0.88em] text-muted-foreground">voxbit.pl</span>
                </span>
            </div>

            <div className="mt-[0.9em] flex items-center gap-[0.6em] rounded-[0.5em] border bg-background p-[0.3em] @min-[41.25rem]/panel:pr-[0.6em]">
                <span className="flex size-[2em] shrink-0 items-center justify-center rounded-[0.35em] bg-muted text-[0.82em] font-semibold">TF</span>
                <span className="hidden min-w-0 flex-1 truncate text-[0.98em] font-medium @min-[41.25rem]/panel:block">Twoja firma</span>
                <ChevronsUpDown aria-hidden="true" className="hidden size-[1em] shrink-0 text-muted-foreground @min-[41.25rem]/panel:block" strokeWidth={1.75} />
            </div>

            <ul className="relative mt-[1em] flex flex-col" style={{ gap: `${NAV_GAP}em` }}>
                <span
                    style={{ '--nav': activeIndex, height: `${NAV_ROW}em` } as CSSProperties}
                    className="absolute inset-x-0 top-0 translate-y-[calc(var(--nav)*2.55em)] rounded-[0.45em] bg-foreground/[0.07] transition-transform duration-300 ease-expo-out dark:bg-foreground/[0.1]"
                />
                {PANEL_NAV.map(({ label, icon: Icon }, index) => (
                    <li
                        key={label}
                        data-active={index === activeIndex}
                        style={{ height: `${NAV_ROW}em` }}
                        className="relative flex items-center justify-center gap-[0.7em] text-foreground/65 transition-colors duration-300 data-[active=true]:text-foreground @min-[41.25rem]/panel:justify-start @min-[41.25rem]/panel:px-[0.7em]"
                    >
                        <Icon aria-hidden="true" className="size-[1.15em] shrink-0" strokeWidth={1.75} />
                        <span className="hidden truncate text-[0.98em] @min-[41.25rem]/panel:inline">{label}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-auto flex h-[2.4em] items-center justify-center gap-[0.7em] text-foreground/65 @min-[41.25rem]/panel:justify-start @min-[41.25rem]/panel:px-[0.7em]">
                <span className="relative">
                    <MessagesSquare aria-hidden="true" className="size-[1.15em] shrink-0" strokeWidth={1.75} />
                    <span className="absolute -top-[0.2em] -right-[0.25em] size-[0.45em] bg-foreground" />
                </span>
                <span className="hidden truncate text-[0.98em] @min-[41.25rem]/panel:inline">Czat z zespołem</span>
            </div>
        </div>
    );
}
