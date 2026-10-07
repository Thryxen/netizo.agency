/**
 * Content of "Jak pracujemy" (spec v5) and the relay's timing. Every step says in one sentence what happens and in
 * one line what the client gets; its live artifact shows that deliverable being made.
 */

export type ProcessStep = {
    /** A real sequence, so numbered (font-mono). */
    number: string;
    title: string;
    /** One plain sentence: what happens in this step. */
    text: string;
    /** What the client gets ("Dostajesz: …"). */
    deliverable: string;
    tags: string[];
};

export const PROCESS_STEPS: ProcessStep[] = [
    {
        number: '01',
        title: 'Odkrywanie',
        text: 'Poznajemy Twój biznes, cele i konkurencję, a potem spisujemy zakres prac.',
        deliverable: 'brief i zakres prac do akceptacji',
        tags: ['Warsztaty', 'Analiza', 'Strategia'],
    },
    {
        number: '02',
        title: 'Projektowanie',
        text: 'Projektujemy wygląd i klikalny prototyp, zanim powstanie linijka kodu.',
        deliverable: 'klikalny prototyp do przetestowania',
        tags: ['Makiety', 'Prototyp', 'Projekt graficzny'],
    },
    {
        number: '03',
        title: 'Rozwój',
        text: 'Programujemy w dwutygodniowych sprintach i co sprint pokazujemy postępy.',
        deliverable: 'dostęp do wersji testowej i regularne demo',
        tags: ['Sprinty', 'Testy', 'Wersja testowa'],
    },
    {
        number: '04',
        title: 'Wdrożenie',
        text: 'Publikujemy stronę, monitorujemy ją i zostajemy z Tobą po starcie.',
        deliverable: 'działająca strona, monitoring i dostęp do panelu klienta',
        tags: ['Publikacja', 'Monitoring', 'Wsparcie'],
    },
];

/**
 * Where a step is in the relay: not reached yet (its artifact shows its first frame, dimmed), holding the baton (the
 * artifact plays its sequence while the rail runs on to the next marker), or finished (the artifact's final frame).
 * SSR, no JS and reduced motion: every step is `done`.
 */
export type StepState = 'pending' | 'active' | 'done';

/**
 * How long each step holds the baton (ms): its artifact's sequence (≈ 1.4–1.65 s, see ARTIFACT_MS) plus a very short
 * settle on the finished frame. The rail's segment fills over the same time, so it reaches the next marker exactly
 * when the next step starts. 6.3 s in all; the row then stays finished (it plays once per entry into view).
 */
export const STEP_MS = [1500, 1700, 1500, 1600] as const;

/**
 * The artifacts' sub-step clocks (ms per sub-step; the final frame follows the last one). Kept here so their totals
 * stay visibly under STEP_MS.
 */
export const ARTIFACT_MS = {
    /** row 1 → row 2 → row 3 checked → "Do akceptacji" → "Zatwierdzone" (1.4 s). */
    brief: [300, 300, 300, 500],
    /** wireframe → design resolves → comment → bigger photo → "Rozwiązane", v2 (1.65 s). */
    design: [300, 500, 450, 400],
    /** three changes land (each checked, then ticked), the test version updated (1.5 s). */
    sprint: [150, 340, 340, 340, 330],
    /** Testy, Publikacja, Monitoring run in turn, the site is live, the panel is switched on (1.5 s). */
    launch: [200, 300, 300, 300, 400],
} as const satisfies Record<string, readonly number[]>;
