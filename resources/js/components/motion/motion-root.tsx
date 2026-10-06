import { MotionConfig } from 'motion/react';
import { type ReactNode, useEffect } from 'react';

/**
 * App-level motion setup: `motion` components honour the OS reduced-motion setting, and the inline head script
 * learns the app has booted (`data-motion-ready` on <html>), so its fail-safe keeps the `js` gate in place.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
    useEffect(() => {
        document.documentElement.setAttribute('data-motion-ready', '');
    }, []);

    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
