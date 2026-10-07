import { BellRing, Clock, FileText, KeyRound, LayoutGrid, type LucideIcon, Receipt, SquareKanban } from 'lucide-react';

/**
 * Content of the "Panel klienta" section and the sample data of its live mock. Everything the mock shows is a real
 * feature of the client panel (labels are the panel's own); amounts and tasks are examples ("Dane przykładowe.").
 */

/** Two ways of working with the SAME panel (there are no plans). */
export type PanelMode = 'project' | 'retainer';

export const isPanelMode = (value: unknown): value is PanelMode => value === 'project' || value === 'retainer';

export type PanelModeContent = {
    value: PanelMode;
    label: string;
    points: string[];
    /** Accessible name of the mock while this mode shows (the mock itself is a picture). */
    mockLabel: string;
};

export const PANEL_MODES: PanelModeContent[] = [
    {
        value: 'project',
        label: 'Projekt na zlecenie',
        points: [
            'Poprawki i zmiany zgłaszasz jako zadania: opis, zrzut ekranu wklejony ze schowka, załączniki.',
            'Widzisz, na jakim etapie jest każda zmiana: Do zrobienia, W trakcie, Gotowe.',
            'Brief, wymagania i zakres prac akceptujesz w dokumentach projektu.',
            'Faktury pobierasz w PDF, a dostępy do hostingu i domeny trzymasz w zaszyfrowanym sejfie.',
        ],
        mockLabel: 'Podgląd panelu klienta: nowe zadanie ze zrzutem ekranu przechodzi na tablicy od kolumny Do zrobienia do Gotowe.',
    },
    {
        value: 'retainer',
        label: 'Stała współpraca',
        points: [
            'Dodajesz zadania, kiedy tylko pojawi się potrzeba, i ustawiasz ich priorytet.',
            'Przy każdym zadaniu widzisz czas pracy co do minuty i jego koszt według Twojej stawki.',
            'Co miesiąc dostajesz rozliczenie z rozpisanymi godzinami i fakturą do pobrania.',
            'Przypominamy o odnowieniu domeny i hostingu, zanim minie termin.',
        ],
        mockLabel: 'Podgląd panelu klienta: czas pracy i koszt każdego zadania w październiku, razem 12 h 30 min i 1 875,00 zł netto.',
    },
];

export type PanelNavItem = { label: string; icon: LucideIcon };

/** The panel's sidebar, in its own order. */
export const PANEL_NAV: PanelNavItem[] = [
    { label: 'Panel', icon: LayoutGrid },
    { label: 'Tablica', icon: SquareKanban },
    { label: 'Czas pracy', icon: Clock },
    { label: 'Rozliczenia', icon: Receipt },
    { label: 'Dokumenty', icon: FileText },
    { label: 'Dostępy', icon: KeyRound },
    { label: 'Przypomnienia', icon: BellRing },
];

/** Which sidebar item (index into PANEL_NAV) and page title each mode's scene shows. */
export const MODE_PAGE: Record<PanelMode, { nav: number; title: string }> = {
    project: { nav: 1, title: 'Tablica' },
    retainer: { nav: 2, title: 'Czas pracy' },
};

/* ---------------------------------------------------------------------------------------------------------------- */
/* Tablica (Projekt na zlecenie)                                                                                    */

export type ColumnKey = 'urgent' | 'todo' | 'doing' | 'done';

/** The board's columns; the dot is the panel's own status colour (kept small and muted). */
export const BOARD_COLUMNS: { key: ColumnKey; label: string; dot: string }[] = [
    { key: 'urgent', label: 'Pilne', dot: 'bg-[oklch(0.64_0.16_25)]' },
    { key: 'todo', label: 'Do zrobienia', dot: 'bg-[oklch(0.62_0_0)]' },
    { key: 'doing', label: 'W trakcie', dot: 'bg-[oklch(0.62_0.13_255)]' },
    { key: 'done', label: 'Gotowe', dot: 'bg-[oklch(0.66_0.12_155)]' },
];

export const COLUMN_INDEX: Record<ColumnKey, number> = { urgent: 0, todo: 1, doing: 2, done: 3 };

export type Priority = 'Pilny' | 'Wysoki' | 'Normalny' | 'Niski';

/** Filled bars of the priority glyph (Pilny gets its own mark). */
export const PRIORITY_LEVEL: Record<Priority, number> = { Pilny: 4, Wysoki: 3, Normalny: 2, Niski: 1 };

export type BoardTask = {
    id: number;
    title: string;
    priority: Priority;
    attachments?: number;
    comments?: number;
    /** Voxbit is on it (shows the team's avatar bit). */
    assigned?: boolean;
};

/** The task the client adds in the loop. */
export const NEW_TASK: BoardTask & { file: string } = {
    id: 14,
    title: 'Zmień zdjęcie na stronie głównej',
    priority: 'Wysoki',
    file: 'zrzut.png',
};

/** Tasks already on the board, with the column each sits in. */
export const BOARD_TASKS: (BoardTask & { column: ColumnKey })[] = [
    { id: 13, title: 'Dodaj baner', priority: 'Normalny', attachments: 2, column: 'todo' },
    { id: 11, title: 'Nowa podstrona Oferta', priority: 'Normalny', comments: 3, assigned: true, column: 'doing' },
    { id: 12, title: 'Popraw stopkę', priority: 'Niski', comments: 1, assigned: true, column: 'done' },
];

export const TASK_PLACEHOLDER = 'Co trzeba zrobić?';
export const BOARD_TOAST = { title: 'Nowy komentarz w zadaniu #14', body: 'Gotowe, sprawdź proszę.' } as const;

/* ---------------------------------------------------------------------------------------------------------------- */
/* Czas pracy (Stała współpraca)                                                                                    */

/** The client's own hourly rate (net). */
export const HOURLY_RATE = 150;

export type TimeRow = { id: number; title: string; minutes: number };

/** October's tasks; the last one is being worked on (its timer runs until it reaches 1 h 05 min). */
export const TIME_ROWS: TimeRow[] = [
    { id: 11, title: 'Nowa podstrona Oferta', minutes: 495 },
    { id: 13, title: 'Dodaj baner', minutes: 150 },
    { id: 14, title: 'Zmień zdjęcie na stronie głównej', minutes: 40 },
    { id: 15, title: 'Formularz kontaktowy', minutes: 65 },
];

export const LIVE_ROW = TIME_ROWS[TIME_ROWS.length - 1];

/** Seconds on the live timer when the loop starts; it stops at the row's full minutes (1:05:00). */
export const TIMER_START_SECONDS = LIVE_ROW.minutes * 60 - 3;

export const MONTH_MINUTES = TIME_ROWS.reduce((sum, row) => sum + row.minutes, 0);
export const MINUTES_BEFORE_STOP = MONTH_MINUTES - LIVE_ROW.minutes;

export const SETTLEMENT_TOAST = { title: 'Nowe rozliczenie', body: 'Wsparcie, październik, 1 875,00 zł' } as const;

/** "8 h 15 min", "1 h 05 min", "40 min" (no-break spaces). */
export function formatMinutes(total: number): string {
    const hours = Math.floor(total / 60);
    const minutes = total % 60;

    return hours === 0 ? `${minutes} min` : `${hours} h ${String(minutes).padStart(2, '0')} min`;
}

/** "1:04:57" */
export function formatClock(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Cost of `minutes` at the hourly rate, in złoty. */
export const costOf = (minutes: number): number => (minutes * HOURLY_RATE) / 60;
