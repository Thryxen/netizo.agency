import { usePage } from '@inertiajs/react';
import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AdminSharedProps } from '@/types/admin';

/** Shows the one-off success message of the last action, and a form-level error (expired session, server error). */
export function FlashNotice() {
    const { flash, errors } = usePage<AdminSharedProps>().props;
    const success = flash?.success ?? null;
    const formError = errors?.form ?? null;
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
