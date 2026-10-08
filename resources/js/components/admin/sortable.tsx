import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type SortableAreaProps = {
    ids: UniqueIdentifier[];
    onMove: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => void;
    children: ReactNode;
};

/** Drag-and-drop context for a vertical list; the pointer needs a few pixels of movement so clicks still work. */
export function SortableArea({ ids, onMove, children }: SortableAreaProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = ({ active, over }: DragEndEvent): void => {
        if (over && active.id !== over.id) {
            onMove(active.id, over.id);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                {children}
            </SortableContext>
        </DndContext>
    );
}

type HandleProps = {
    setActivatorNodeRef: (element: HTMLElement | null) => void;
    attributes: object;
    listeners: object | undefined;
    disabled: boolean;
};

function DragHandle({ setActivatorNodeRef, attributes, listeners, disabled }: HandleProps) {
    return (
        <Button
            ref={setActivatorNodeRef}
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-grab touch-none active:cursor-grabbing"
            disabled={disabled}
            aria-label="Przeciągnij, aby zmienić kolejność"
            {...attributes}
            {...listeners}
        >
            <GripVerticalIcon />
        </Button>
    );
}

type SortableItemProps = {
    id: UniqueIdentifier;
    disabled?: boolean;
    className?: string;
    children: ReactNode;
};

/** A table row with a drag handle in its first cell. */
export function SortableTableRow({ id, disabled = false, className, children }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

    return (
        <TableRow
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            className={cn(isDragging && 'relative z-10 bg-muted shadow-sm', className)}
        >
            <TableCell className="w-10">
                <DragHandle setActivatorNodeRef={setActivatorNodeRef} attributes={attributes} listeners={listeners} disabled={disabled} />
            </TableCell>
            {children}
        </TableRow>
    );
}

/** A block in a list (repeater item) with a drag handle on the left. */
export function SortableListItem({ id, disabled = false, className, children }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            className={cn('flex items-start gap-2 rounded-md border bg-background p-2', isDragging && 'relative z-10 shadow-sm', className)}
        >
            <DragHandle setActivatorNodeRef={setActivatorNodeRef} attributes={attributes} listeners={listeners} disabled={disabled} />
            {children}
        </div>
    );
}
