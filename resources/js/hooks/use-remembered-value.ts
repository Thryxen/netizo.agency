import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/**
 * Keeps `value` in the current history entry (Inertia's remembered state) so it survives a remount caused by
 * history navigation, e.g. Back to this page from another document. Unlike Inertia's `useRemember`, the stored
 * value is handed to `onRestore` after mount, so the first client render still matches the server-rendered HTML.
 * Writes are debounced because browsers throttle `history.replaceState` (Safari throws past ~100 calls).
 */
export function useRememberedValue<T>(key: string, value: T, onRestore: (remembered: unknown) => void, delayMs = 300): void {
    const latestValueRef = useRef(value);
    const onRestoreRef = useRef(onRestore);
    const isRestoredRef = useRef(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        latestValueRef.current = value;
        onRestoreRef.current = onRestore;
    });

    useEffect(() => {
        const flush = (): void => {
            if (timerRef.current === null) {
                return;
            }

            window.clearTimeout(timerRef.current);
            timerRef.current = null;
            router.remember(latestValueRef.current, key);
        };

        window.addEventListener('pagehide', flush);

        return () => {
            window.removeEventListener('pagehide', flush);

            // An unmount may come from a history swap that already moved to another entry, so don't write here.
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [key]);

    useEffect(() => {
        if (!isRestoredRef.current) {
            isRestoredRef.current = true;

            const remembered: unknown = router.restore(key);

            if (remembered !== undefined) {
                onRestoreRef.current(remembered);
            }

            return;
        }

        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
        }

        timerRef.current = window.setTimeout(() => {
            timerRef.current = null;
            router.remember(latestValueRef.current, key);
        }, delayMs);
    }, [key, value, delayMs]);
}
