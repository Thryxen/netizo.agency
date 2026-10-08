import { CheckIcon, CopyIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';

export function DetailList({ children }: { children: ReactNode }) {
    return <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{children}</dl>;
}

type DetailItemProps = {
    label: string;
    children?: ReactNode;
    empty?: string;
    className?: string;
};

export function DetailItem({ label, children, empty = 'Nie podano', className }: DetailItemProps) {
    const isEmpty = children === null || children === undefined || children === '' || children === false;

    return (
        <div className={className}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm break-words whitespace-pre-line">{isEmpty ? <span className="text-muted-foreground">{empty}</span> : children}</dd>
        </div>
    );
}

/** Copies a value to the clipboard on click and briefly confirms it. */
export function CopyButton({ value, label }: { value: string; label: string }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) {
            return;
        }

        const timer = window.setTimeout(() => setCopied(false), 1500);

        return () => window.clearTimeout(timer);
    }, [copied]);

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={copied ? 'Skopiowano' : `Kopiuj: ${label}`}
            onClick={() => {
                void navigator.clipboard.writeText(value).then(() => setCopied(true));
            }}
        >
            {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
    );
}
