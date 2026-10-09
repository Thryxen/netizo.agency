import { createContext, type ReactNode, type RefObject, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useRememberedValue } from '@/hooks/use-remembered-value';
import { goToSection } from '@/lib/in-page-navigation';
import { useHomeSections } from '@/lib/sections';

export type ContactTab = 'brief' | 'quick';

export const isContactTab = (value: unknown): value is ContactTab => value === 'brief' || value === 'quick';

export type HomeUi = {
    callbackOpen: boolean;
    setCallbackOpen: (open: boolean) => void;
    /** Opens the callback dialog; focus returns to `opener` (default: the focused element) when it closes. */
    openCallback: (opener?: HTMLElement | null) => void;
    /** Element to refocus when the callback dialog closes (it has no DialogTrigger Radix could return to). */
    callbackReturnFocusRef: RefObject<HTMLElement | null>;
    contactTab: ContactTab;
    setContactTab: (tab: ContactTab) => void;
    /** Sets the tab (when given), then scrolls to the contact section (#kontakt, #contact) and moves focus to its heading. */
    openContact: (tab?: ContactTab) => void;
};

const HomeUiContext = createContext<HomeUi | null>(null);

/**
 * Run the callback once no Radix overlay (dialog/sheet) holds the body scroll lock — a closing
 * overlay keeps it for the length of its exit animation, which would swallow the scroll.
 */
export function whenScrollUnlocked(callback: () => void, timeoutMs = 1000): void {
    const deadline = performance.now() + timeoutMs;

    const check = (): void => {
        if (!document.body.hasAttribute('data-scroll-locked') || performance.now() > deadline) {
            callback();

            return;
        }

        window.requestAnimationFrame(check);
    };

    window.requestAnimationFrame(check);
}

export function HomeUiProvider({ children }: { children: ReactNode }): ReactNode {
    const [callbackOpen, setCallbackOpen] = useState(false);
    const [contactTab, setContactTab] = useState<ContactTab>('brief');
    const callbackReturnFocusRef = useRef<HTMLElement | null>(null);
    const contactSectionId = useHomeSections().contact;

    useRememberedValue('home:contact-tab', contactTab, (remembered) => {
        if (isContactTab(remembered)) {
            setContactTab(remembered);
        }
    });

    const openCallback = useCallback((opener?: HTMLElement | null) => {
        const active = document.activeElement;

        callbackReturnFocusRef.current = opener ?? (active instanceof HTMLElement && active !== document.body ? active : null);
        setCallbackOpen(true);
    }, []);

    const openContact = useCallback((tab?: ContactTab) => {
        if (tab) {
            setContactTab(tab);
        }

        // Let React commit the tab switch and any closing dialog/sheet release its scroll lock first.
        whenScrollUnlocked(() => goToSection(contactSectionId));
    }, [contactSectionId]);

    const value = useMemo<HomeUi>(
        () => ({ callbackOpen, setCallbackOpen, openCallback, callbackReturnFocusRef, contactTab, setContactTab, openContact }),
        [callbackOpen, openCallback, contactTab, openContact],
    );

    return <HomeUiContext.Provider value={value}>{children}</HomeUiContext.Provider>;
}

export function useHomeUi(): HomeUi {
    const context = useContext(HomeUiContext);

    if (!context) {
        throw new Error('useHomeUi() must be used inside <HomeUiProvider>.');
    }

    return context;
}
