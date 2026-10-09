import { SiteFooter } from '@/components/home/site-footer';
import { MotionRoot } from '@/components/motion/motion-root';
import { AudienceSection } from '@/components/partners/audience-section';
import { CommissionCalculator } from '@/components/partners/commission-calculator';
import { JoinSection } from '@/components/partners/join-section';
import { PartnerFaqSection } from '@/components/partners/partner-faq-section';
import { PartnerHeader } from '@/components/partners/partner-header';
import { PartnerHero } from '@/components/partners/partner-hero';
import { RulesSection } from '@/components/partners/rules-section';
import { StepsSection } from '@/components/partners/steps-section';
import { useInPageAnchors } from '@/hooks/use-in-page-anchors';
import type { PartnersPageProps } from '@/types/partners';

/** Program partnerski (/partnerzy): a page of its own, with its own header; the footer is the site's. */
export default function Partners({ faq }: PartnersPageProps) {
    useInPageAnchors();

    return (
        <MotionRoot>
            <a
                href="#main-content"
                className="sr-only rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                Przejdź do treści
            </a>
            <PartnerHeader />
            <main id="main-content" tabIndex={-1} className="outline-none">
                <PartnerHero />
                <StepsSection />
                <CommissionCalculator />
                <AudienceSection />
                <RulesSection />
                <PartnerFaqSection faq={faq} />
                <JoinSection />
            </main>
            <SiteFooter homeHref="/" />
        </MotionRoot>
    );
}
