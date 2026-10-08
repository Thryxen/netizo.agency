import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { FormField } from '@/components/admin/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminClient } from '@/types/admin';

type ClientFormProps = {
    client?: AdminClient;
    nextSortOrder?: number;
};

export function ClientForm({ client, nextSortOrder = 1 }: ClientFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: client?.name ?? '',
        url: client?.url ?? '',
        sort_order: client?.sortOrder ?? nextSortOrder,
        is_active: client?.isActive ?? true,
    });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (client) {
            put(adminRoutes.clients.update(client.id));

            return;
        }

        post(adminRoutes.clients.index);
    };

    return (
        <form onSubmit={submit} className="grid max-w-2xl gap-6" noValidate>
            <FormField label="Nazwa klienta" htmlFor="name" error={errors.name}>
                <Input id="name" required value={data.name} aria-invalid={Boolean(errors.name)} onChange={(event) => setData('name', event.target.value)} />
            </FormField>

            <FormField label="Link (opcjonalnie)" htmlFor="url" error={errors.url} hint="Gdy pusty, nazwa klienta na stronie nie jest linkiem.">
                <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={data.url}
                    aria-invalid={Boolean(errors.url)}
                    onChange={(event) => setData('url', event.target.value)}
                />
            </FormField>

            <FormField label="Kolejność" htmlFor="sort_order" error={errors.sort_order} hint="Mniejsza liczba oznacza wyższą pozycję na liście.">
                <Input
                    id="sort_order"
                    type="number"
                    min={0}
                    className="max-w-40"
                    value={data.sort_order}
                    aria-invalid={Boolean(errors.sort_order)}
                    onChange={(event) => setData('sort_order', Number(event.target.value))}
                />
            </FormField>

            <div className="flex items-center gap-3">
                <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                <Label htmlFor="is_active">Widoczny na stronie</Label>
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing}>
                    {client ? 'Zapisz zmiany' : 'Dodaj klienta'}
                </Button>
                <Button asChild variant="ghost">
                    <Link href={adminRoutes.clients.index}>Anuluj</Link>
                </Button>
            </div>
        </form>
    );
}
