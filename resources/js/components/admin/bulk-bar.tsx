import { Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function BulkBar({ count, onDelete }: { count: number; onDelete: () => void }) {
    if (count === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/50 px-3 py-2 text-sm">
            <span>Zaznaczono: {count}</span>
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
                <Trash2Icon />
                Usuń zaznaczone
            </Button>
        </div>
    );
}
