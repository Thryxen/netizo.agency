import { BellRing, Clock, FileText, KeyRound, LayoutGrid, type LucideIcon, Receipt, SquareKanban } from 'lucide-react';
import { localized } from '@/lib/i18n';

/**
 * Content of the "Panel klienta" section and the sample data of its live mock. Everything the mock shows is a real
 * feature of the client panel (labels are the panel's own); amounts and tasks are examples ("Dane przykładowe.").
 * Text is localized (`localized`, read with `useCopy`); structure, ids and figures are shared by both languages.
 */

/** Two ways of working with the SAME panel (there are no plans). */
export type PanelMode = 'project' | 'retainer';

export const isPanelMode = (value: unknown): value is PanelMode => value === 'project' || value === 'retainer';

export const PANEL_MODE_VALUES: PanelMode[] = ['project', 'retainer'];

export type PanelModeContent = {
    value: PanelMode;
    label: string;
    points: string[];
    /** Accessible name of the mock while this mode shows (the mock itself is a picture). */
    mockLabel: string;
};

export const PANEL_MODES = localized<PanelModeContent[]>({
    pl: [
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
    ],
    en: [
        {
            value: 'project',
            label: 'One-off project',
            points: [
                'You report fixes and changes as tasks: a description, a screenshot pasted from the clipboard, attachments.',
                'You see where every change stands: To do, In progress, Done.',
                'You approve the brief, the requirements and the scope of work in the project documents.',
                'You download invoices as PDFs and keep your hosting and domain credentials in an encrypted vault.',
            ],
            mockLabel: 'Client portal preview: a new task with a screenshot moves across the board from To do to Done.',
        },
        {
            value: 'retainer',
            label: 'Ongoing retainer',
            points: [
                'You add tasks whenever the need comes up and set their priority.',
                'For every task you see the time spent, to the minute, and its cost at your own rate.',
                'Every month you get a statement with the hours broken down and an invoice to download.',
                'We remind you to renew your domain and hosting before they expire.',
            ],
            mockLabel: 'Client portal preview: the time spent on each task in October and its cost, 12 h 30 min and PLN 1,875.00 net in total.',
        },
    ],
});

/** Icons of the panel's sidebar, in its own order (the labels are PANEL_TEXT.nav, index for index). */
export const PANEL_NAV_ICONS: LucideIcon[] = [LayoutGrid, SquareKanban, Clock, Receipt, FileText, KeyRound, BellRing];

/** Which sidebar item (index into PANEL_NAV_ICONS) each mode's scene shows; its title is PANEL_TEXT.pages[mode]. */
export const MODE_PAGE: Record<PanelMode, { nav: number }> = {
    project: { nav: 1 },
    retainer: { nav: 2 },
};

/* ---------------------------------------------------------------------------------------------------------------- */
/* Tablica (Projekt na zlecenie)                                                                                    */

export type ColumnKey = 'urgent' | 'todo' | 'doing' | 'done';

/** The board's columns; the dot is the panel's own status colour (kept small and muted). Labels: PANEL_TEXT.columns. */
export const BOARD_COLUMNS: { key: ColumnKey; dot: string }[] = [
    { key: 'urgent', dot: 'bg-[oklch(0.64_0.16_25)]' },
    { key: 'todo', dot: 'bg-[oklch(0.62_0_0)]' },
    { key: 'doing', dot: 'bg-[oklch(0.62_0.13_255)]' },
    { key: 'done', dot: 'bg-[oklch(0.66_0.12_155)]' },
];

export const COLUMN_INDEX: Record<ColumnKey, number> = { urgent: 0, todo: 1, doing: 2, done: 3 };

export type Priority = 'urgent' | 'high' | 'normal' | 'low';

/** Filled bars of the priority glyph (urgent gets its own mark). Labels: PANEL_TEXT.priorities. */
export const PRIORITY_LEVEL: Record<Priority, number> = { urgent: 4, high: 3, normal: 2, low: 1 };

/** Ids of the sample tasks (their titles: PANEL_TEXT.tasks). */
export type TaskId = 11 | 12 | 13 | 14 | 15;

export type BoardTask = {
    id: TaskId;
    priority: Priority;
    attachments?: number;
    comments?: number;
    /** Netizo is on it (shows the team's avatar bit). */
    assigned?: boolean;
};

/** The task the client adds in the loop (its file name: PANEL_TEXT.newTaskFile). */
export const NEW_TASK: BoardTask = { id: 14, priority: 'high' };

/** Tasks already on the board, with the column each sits in. */
export const BOARD_TASKS: (BoardTask & { column: ColumnKey })[] = [
    { id: 13, priority: 'normal', attachments: 2, column: 'todo' },
    { id: 11, priority: 'normal', comments: 3, assigned: true, column: 'doing' },
    { id: 12, priority: 'low', comments: 1, assigned: true, column: 'done' },
];

/* ---------------------------------------------------------------------------------------------------------------- */
/* Czas pracy (Stała współpraca)                                                                                    */

/** The client's own hourly rate (net). */
export const HOURLY_RATE = 150;

export type TimeRow = { id: TaskId; minutes: number };

/** October's tasks; the last one is being worked on (its timer runs until it reaches 1 h 05 min). */
export const TIME_ROWS: TimeRow[] = [
    { id: 11, minutes: 495 },
    { id: 13, minutes: 150 },
    { id: 14, minutes: 40 },
    { id: 15, minutes: 65 },
];

export const LIVE_ROW = TIME_ROWS[TIME_ROWS.length - 1];

/** Seconds on the live timer when the loop starts; it stops at the row's full minutes (1:05:00). */
export const TIMER_START_SECONDS = LIVE_ROW.minutes * 60 - 3;

export const MONTH_MINUTES = TIME_ROWS.reduce((sum, row) => sum + row.minutes, 0);
export const MINUTES_BEFORE_STOP = MONTH_MINUTES - LIVE_ROW.minutes;

/* ---------------------------------------------------------------------------------------------------------------- */
/* The mock's own text (the panel's labels, the sample tasks and notifications)                                     */

export const PANEL_TEXT = localized({
    pl: {
        panelName: 'Panel klienta',
        company: 'Twoja firma',
        companyInitials: 'TF',
        nav: ['Panel', 'Tablica', 'Czas pracy', 'Rozliczenia', 'Dokumenty', 'Dostępy', 'Przypomnienia'],
        teamChat: 'Czat z zespołem',
        pages: { project: 'Tablica', retainer: 'Czas pracy' } satisfies Record<PanelMode, string>,
        columns: { urgent: 'Pilne', todo: 'Do zrobienia', doing: 'W trakcie', done: 'Gotowe' } satisfies Record<ColumnKey, string>,
        priorities: { urgent: 'Pilny', high: 'Wysoki', normal: 'Normalny', low: 'Niski' } satisfies Record<Priority, string>,
        tasks: {
            11: 'Nowa podstrona Oferta',
            12: 'Popraw stopkę',
            13: 'Dodaj baner',
            14: 'Zmień zdjęcie na stronie głównej',
            15: 'Formularz kontaktowy',
        } satisfies Record<TaskId, string>,
        newTaskFile: 'zrzut.png',
        addTask: 'Dodaj task',
        noTasks: 'Brak zadań',
        taskPlaceholder: 'Co trzeba zrobić?',
        descriptionPlaceholder: 'Opis, zrzuty ekranu i załączniki',
        pasted: 'Wklejono ze schowka',
        priority: 'Priorytet',
        boardToast: { title: 'Nowy komentarz w zadaniu #14', body: 'Gotowe, sprawdź proszę.' },
        settlementToast: { title: 'Nowe rozliczenie', body: 'Wsparcie, październik, 1 875,00 zł' },
        downloadInvoice: 'Pobierz fakturę',
        now: 'teraz',
        sampleData: 'Dane przykładowe.',
        month: 'Październik 2026',
        monthTotal: 'Razem w miesiącu',
        yourRate: 'Twoja stawka',
        net: 'netto',
        columnTask: 'Zadanie',
        columnTime: 'Czas',
        columnCost: 'Koszt',
        running: 'W trakcie',
    },
    en: {
        panelName: 'Client portal',
        company: 'Your company',
        companyInitials: 'YC',
        nav: ['Dashboard', 'Board', 'Time tracking', 'Billing', 'Documents', 'Credentials', 'Reminders'],
        teamChat: 'Team chat',
        pages: { project: 'Board', retainer: 'Time tracking' },
        columns: { urgent: 'Urgent', todo: 'To do', doing: 'In progress', done: 'Done' },
        priorities: { urgent: 'Urgent', high: 'High', normal: 'Normal', low: 'Low' },
        tasks: {
            11: 'New Services page',
            12: 'Fix the footer',
            13: 'Add a banner',
            14: 'Change the homepage photo',
            15: 'Contact form',
        },
        newTaskFile: 'screenshot.png',
        addTask: 'Add task',
        noTasks: 'No tasks',
        taskPlaceholder: 'What needs to be done?',
        descriptionPlaceholder: 'Description, screenshots, files',
        pasted: 'Pasted from clipboard',
        priority: 'Priority',
        boardToast: { title: 'New comment on task #14', body: 'Done, please take a look.' },
        settlementToast: { title: 'New statement', body: 'Support, October, PLN 1,875.00' },
        downloadInvoice: 'Download invoice',
        now: 'now',
        sampleData: 'Sample data.',
        month: 'October 2026',
        monthTotal: 'Total this month',
        yourRate: 'Your rate',
        net: 'net',
        columnTask: 'Task',
        columnTime: 'Time',
        columnCost: 'Cost',
        running: 'In progress',
    },
});

/** "8 h 15 min", "1 h 05 min", "40 min" (no-break spaces; the same units in both languages). */
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
