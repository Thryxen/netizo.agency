import { useRef } from 'react';
import { bleedClassName, gutterClassName, Section } from '@/components/home/section';
import { useEntrance } from '@/components/motion';
import { CommissionBar } from '@/components/partners/commission-bar';
import { commission } from '@/components/partners/partner-data';
import { Button } from '@/components/ui/button';
import { formatPln, localized, useCopy, useLocale } from '@/lib/i18n';
import { usePageUrls } from '@/lib/site';
import { cn } from '@/lib/utils';

/** The worked example: the hero scene's first order on the partner page (an online store). */
const EXAMPLE_ORDER_VALUE = 18000;

const COPY = localized({
    pl: {
        title: 'Poleć nas i zyskaj 15%',
        text: 'Znasz firmę, która potrzebuje strony, sklepu albo aplikacji? Przekaż jej kontakt do nas, a od każdego jej zamówienia dostaniesz 15% netto.',
        cta: 'Zostań partnerem',
        example: (value: string): string => `Przykład: sklep internetowy za ${value} netto`,
        netizoShare: 'Netizo 85%',
        partnerShare: 'Twoje 15%',
        forYou: 'dla Ciebie',
    },
    en: {
        title: 'Refer us and earn 15%',
        text: 'Know a company that needs a website, an online store or an app? Put them in touch with us, and you’ll earn 15% of the net value of every order they place.',
        cta: 'Become a partner',
        example: (value: string): string => `Example: an online store for ${value} net`,
        netizoShare: 'Netizo 85%',
        partnerShare: 'Your 15%',
        forYou: 'for you',
    },
});

/**
 * The example's 15% slice waits empty under the `html.js` gate and fills the first time the example is in view;
 * SSR, no JS and reduced motion show it filled.
 */
const PARTNER_CTA_CSS = `
@media screen and (prefers-reduced-motion: no-preference) {
    .js [data-partner-cta]:not([data-entered]) [data-commission-fill] { transform: scaleX(0); }
    [data-partner-cta][data-entered] [data-commission-fill] { transition-delay: 150ms; }
}
`;

/**
 * Program partnerski: a bleed split band that leads to the partner page (/partnerzy, /en/partners), the offer on the left and a worked example on
 * the right (an order's value split 85/15, the partner's share as the figure).
 */
export function PartnerCtaSection() {
    const exampleRef = useRef<HTMLDivElement>(null);
    const entrance = useEntrance(exampleRef, { amount: 0.6 });
    const copy = useCopy(COPY);
    const locale = useLocale();
    const pageUrls = usePageUrls();

    return (
        <Section labelledBy="partner-cta-heading" containerClassName="py-0 md:py-0">
            <style>{PARTNER_CTA_CSS}</style>
            <div className={cn('grid gap-px bg-border lg:grid-cols-12', bleedClassName)}>
                <div className={cn('bg-background py-12 md:py-16 lg:col-span-7', gutterClassName)}>
                    <h2 id="partner-cta-heading" className="text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">
                        {copy.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">{copy.text}</p>
                    <Button size="lg" className="mt-8 max-md:h-11" asChild>
                        <a href={pageUrls.partners}>{copy.cta}</a>
                    </Button>
                </div>

                <div
                    ref={exampleRef}
                    data-partner-cta=""
                    data-entered={entrance === 'pending' ? undefined : ''}
                    className={cn('flex flex-col justify-center bg-background py-10 md:py-12 lg:col-span-5', gutterClassName)}
                >
                    <p className="text-sm text-muted-foreground">{copy.example(formatPln(EXAMPLE_ORDER_VALUE, locale))}</p>
                    <CommissionBar filled className="mt-4" />
                    <div className="mt-2 flex items-baseline justify-between gap-4 text-xs text-muted-foreground">
                        <span>{copy.netizoShare}</span>
                        <span>{copy.partnerShare}</span>
                    </div>
                    <p className="mt-6 flex items-baseline gap-3">
                        <span className="text-[2.5rem] leading-none font-semibold tracking-[-0.04em] tabular-nums">{formatPln(commission(EXAMPLE_ORDER_VALUE), locale)}</span>
                        <span className="text-sm text-muted-foreground">{copy.forYou}</span>
                    </p>
                </div>
            </div>
        </Section>
    );
}
