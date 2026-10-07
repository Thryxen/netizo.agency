/**
 * Motion primitives for the home page (spec v2 §2). Import from '@/components/motion'.
 *
 * Bundle budget (≤ ~45 KB gz added): entrances are CSS-driven primitives (Reveal, SplitLines,
 * CountUp, Marquee), loops use useLiveLoop + CSS. For scroll-driven motion use useScroll + useTransform from
 * 'motion/react' and bind the values with useMotionStyle(ref, { y }) on a plain element (≈14 KB gz).
 * Avoid `motion.*` / `m.*` components and `animate()`: they need motion's animation engine (+26–28 KB gz), and
 * `m.*` without LazyMotion features never renders MotionValue updates. Scroll-linked styles are not covered by
 * <MotionConfig reducedMotion>: gate them with useReducedMotionPreference() (flat output range).
 */
export { CountUp, formatDisplayNumber, parseDisplayNumber, type CountUpProps } from './count-up';
export { Marquee, type MarqueeProps } from './marquee';
export {
    isMotionGateOpen,
    motionTokens,
    observeOnce,
    useCanAnimate,
    useEntrance,
    useReducedMotionPreference,
    type EntranceOptions,
    type EntranceState,
} from './motion-env';
export { MotionRoot } from './motion-root';
export { Reveal, type RevealProps } from './reveal';
export { SplitLines, type SplitLinesProps } from './split-lines';
export { useMotionStyle } from './use-motion-style';
export { Spotlight, SpotlightLayer, useSpotlight } from './spotlight';
export {
    useInViewLoop,
    useLiveLoop,
    useLoopStep,
    type InViewLoop,
    type InViewLoopOptions,
    type LiveLoop,
    type LoopStepOptions,
} from './use-in-view-loop';
