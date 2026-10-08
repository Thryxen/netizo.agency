import { usePage } from '@inertiajs/react';
import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AdminSharedProps } from '@/types/admin';

/**
 * Shows the one-off success message of the last action, and an error that belongs to no field: a form-level one
 * (expired session, server error) or a rejected list of ids (a stale reorder or bulk delete).
 */
export function FlashNotice() {
    const { flash, errors } = usePage<AdminSharedProps>().props;
    const success = flash?.success ?? null;
    const idsError = Object.entries(errors ?? {}).find(([key]) => key === 'ids' || key.startsWith('ids.'))?.[1] ?? null;
    const formError = errors?.form ?? idsError;
    const [visible, setVisible] = useState(Boolean(success));

    useEffect(() => {
        setVisible(Boolean(success));

        if (!success) {
            return;
        }

        const timer = window.setTimeout(() => setVisible(false), 6000);

        return () => window.clearTimeout(timer);
    }, [flash, success]);

    return (
        <>
            {visible && success ? (
                <Alert role="status">
                    <CircleCheckIcon />
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            ) : null}
            {formError ? (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertDescription>{formError}</AlertDescription>
                </Alert>
            ) : null}
        </>
    );
}
