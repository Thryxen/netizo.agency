import { cn } from '@/lib/utils';

type CommissionBarProps = {
    /** The partner's 15% slice is filled (it fills from the left of its segment, as a transform transition). */
    filled: boolean;
    className?: string;
};

/** An order's net value split 85/15: Netizo's part as a track, the partner's 15% as an ink slice. Decorative. */
export function CommissionBar({ filled, className }: CommissionBarProps) {
    return (
        <div aria-hidden="true" className={cn('flex h-2 gap-[3px]', className)}>
            <span className="h-full flex-[85] rounded-l-full bg-foreground/12 dark:bg-foreground/18" />
            <span className="relative h-full flex-[15] overflow-hidden rounded-r-full bg-foreground/12 dark:bg-foreground/18">
                <span
                    data-commission-fill=""
                    data-show={filled}
                    className="absolute inset-0 origin-left bg-foreground transition-transform duration-900 ease-expo-out data-[show=false]:scale-x-0"
                />
            </span>
        </div>
    );
}
