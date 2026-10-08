import { arrayMove } from '@dnd-kit/sortable';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useRef, type ReactNode } from 'react';

import { SortableArea, SortableListItem } from '@/components/admin/sortable';
import { Button } from '@/components/ui/button';

type RepeaterListProps<T> = {
    value: T[];
    onChange: (value: T[]) => void;
    createItem: () => T;
    renderItem: (item: T, update: (item: T) => void, index: number) => ReactNode;
    addLabel: string;
    itemLabel: string;
    min?: number;
    max?: number;
    error?: string;
};

/** Stable identities for the items, kept next to the value so that dragging and editing do not remount inputs. */
function useItemKeys(length: number) {
    const next = useRef(0);
    const keys = useRef<number[]>([]);

    while (keys.current.length < length) {
        keys.current.push(next.current++);
    }

    if (keys.current.length > length) {
        keys.current.length = length;
    }

    return { keys, next };
}

/** A list of repeatable inputs that can be added, removed and dragged into a new order. */
export function RepeaterList<T>({ value, onChange, createItem, renderItem, addLabel, itemLabel, min = 0, max = Infinity, error }: RepeaterListProps<T>) {
    const { keys, next } = useItemKeys(value.length);

    const add = (): void => {
        keys.current.push(next.current++);
        onChange([...value, createItem()]);
    };

    const remove = (index: number): void => {
        keys.current.splice(index, 1);
        onChange(value.filter((_, position) => position !== index));
    };

    const update = (index: number, item: T): void => {
        onChange(value.map((current, position) => (position === index ? item : current)));
    };

    const move = (activeId: string | number, overId: string | number): void => {
        const from = keys.current.indexOf(Number(activeId));
        const to = keys.current.indexOf(Number(overId));

        if (from === -1 || to === -1) {
            return;
        }

        keys.current = arrayMove(keys.current, from, to);
        onChange(arrayMove(value, from, to));
    };

    return (
        <div className="grid gap-2">
            <SortableArea ids={keys.current} onMove={move}>
                {value.map((item, index) => (
                    <SortableListItem key={keys.current[index]} id={keys.current[index]}>
                        <div className="min-w-0 flex-1">{renderItem(item, (updated) => update(index, updated), index)}</div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`${itemLabel}: usuń pozycję ${index + 1}`}
                            disabled={value.length <= min}
                            onClick={() => remove(index)}
                        >
                            <Trash2Icon />
                        </Button>
                    </SortableListItem>
                ))}
            </SortableArea>
            {error ? (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            ) : null}
            <div>
                <Button type="button" variant="outline" size="sm" disabled={value.length >= max} onClick={add}>
                    <PlusIcon />
                    {addLabel}
                </Button>
            </div>
        </div>
    );
}
