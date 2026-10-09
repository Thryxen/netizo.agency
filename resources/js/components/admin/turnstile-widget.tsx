import { useEffect, useEffectEvent, useImperativeHandle, useRef, useState, type Ref } from 'react';

import { useAppearance } from '@/hooks/use-appearance';

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileRenderOptions = {
    sitekey: string;
    action?: string;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'flexible' | 'compact';
    language?: string;
    callback?: (token: string) => void;
    'expired-callback'?: () => void;
    'error-callback'?: () => void;
};

type TurnstileApi = {
    render: (container: HTMLElement, options: TurnstileRenderOptions) => string | null | undefined;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
};

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

let loading: Promise<TurnstileApi> | null = null;

/** Cloudflare's script, added once per page load; explicit rendering, so a widget appears only through `render()`. */
function loadTurnstile(): Promise<TurnstileApi> {
    if (window.turnstile) {
        return Promise.resolve(window.turnstile);
    }

    loading ??= new Promise<TurnstileApi>((resolve, reject) => {
        const script = document.createElement('script');

        script.src = SCRIPT_URL;
        script.async = true;
        script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile is unavailable')));
        script.onerror = () => {
            loading = null;
            script.remove();
            reject(new Error('Turnstile failed to load'));
        };

        document.head.append(script);
    });

    return loading;
}

export type TurnstileWidgetHandle = {
    /** A token passes siteverify once, so the form asks for a fresh one after every submit. */
    reset: () => void;
};

type TurnstileWidgetProps = {
    siteKey: string;
    action: string;
    /** The current token, or an empty string while there is none (loading, expired, failed). */
    onTokenChange: (token: string) => void;
    ref?: Ref<TurnstileWidgetHandle>;
};

/** Cloudflare Turnstile widget (managed mode), as wide as the form and in the panel's theme. */
export function TurnstileWidget({ siteKey, action, onTokenChange, ref }: TurnstileWidgetProps) {
    const { appearance } = useAppearance();
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const changeToken = useEffectEvent(onTokenChange);

    useImperativeHandle(
        ref,
        () => ({
            reset: () => {
                if (widgetIdRef.current) {
                    window.turnstile?.reset(widgetIdRef.current);
                }

                onTokenChange('');
            },
        }),
        [onTokenChange],
    );

    useEffect(() => {
        let cancelled = false;

        loadTurnstile()
            .then((turnstile) => {
                if (cancelled || !containerRef.current) {
                    return;
                }

                widgetIdRef.current =
                    turnstile.render(containerRef.current, {
                        sitekey: siteKey,
                        action,
                        theme: appearance,
                        size: 'flexible',
                        language: 'pl',
                        callback: (token) => changeToken(token),
                        'expired-callback': () => changeToken(''),
                        'error-callback': () => changeToken(''),
                    }) ?? null;
            })
            .catch(() => {
                if (!cancelled) {
                    setLoadFailed(true);
                }
            });

        return () => {
            cancelled = true;

            if (widgetIdRef.current) {
                window.turnstile?.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }

            changeToken('');
        };
    }, [siteKey, action, appearance]);

    if (loadFailed) {
        return (
            <p className="text-sm text-destructive" role="alert">
                Nie udało się wczytać weryfikacji Cloudflare. Wyłącz blokowanie skryptów i odśwież stronę.
            </p>
        );
    }

    return <div ref={containerRef} className="min-h-[65px]" />;
}
