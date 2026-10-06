import { cn } from '@/lib/utils';

type ThemedImageProps = {
    /** Image shown in the light theme. */
    light: string;
    /** Same drawing for the dark theme. */
    dark: string;
    alt: string;
    width: number;
    height: number;
    loading?: 'lazy' | 'eager';
    className?: string;
};

/** A light/dark pair of the same illustration; CSS shows the one matching the current theme. */
export function ThemedImage({ light, dark, alt, width, height, loading = 'lazy', className }: ThemedImageProps) {
    return (
        <>
            <img src={light} alt={alt} width={width} height={height} loading={loading} decoding="async" className={cn(className, 'dark:hidden')} />
            <img src={dark} alt={alt} width={width} height={height} loading={loading} decoding="async" className={cn(className, 'hidden dark:block')} />
        </>
    );
}
