import { useCallback, useState } from 'react';

export function useSelection() {
    const [selected, setSelected] = useState<number[]>([]);

    const toggle = useCallback((id: number): void => {
        setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    }, []);

    /** Selects every given id, or clears them when all of them are already selected. */
    const toggleAll = useCallback((ids: number[]): void => {
        setSelected((current) =>
            ids.length > 0 && ids.every((id) => current.includes(id))
                ? current.filter((id) => !ids.includes(id))
                : Array.from(new Set([...current, ...ids])),
        );
    }, []);

    const clear = useCallback((): void => setSelected([]), []);

    /** Drops the ids that are no longer in the list (deleted elsewhere), so they never count in a bulk action. */
    const retain = useCallback((ids: number[]): void => {
        setSelected((current) => {
            const kept = current.filter((id) => ids.includes(id));

            return kept.length === current.length ? current : kept;
        });
    }, []);

    return { selected, toggle, toggleAll, clear, retain };
}
