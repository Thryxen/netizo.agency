import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TechTagProps = {
    children: string;
    /** sm: list tags (services, process, projects); md: the larger tags in the case study. */
    size?: 'sm' | 'md';
    className?: string;
};

/**
 * Technology tag: an outline badge with square-ish corners, so it belongs to the bit grid rather than
 * reading as a rounded SaaS pill.
 */
export function TechTag({ children, size = 'sm', className }: TechTagProps) {
    return (
        <Badge
            variant="outline"
            className={cn('rounded-[3px] font-normal text-muted-foreground', size === 'md' && 'px-2.5 py-1 text-sm', className)}
        >
            {children}
        </Badge>
    );
}
