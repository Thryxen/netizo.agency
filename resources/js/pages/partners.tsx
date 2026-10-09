import { SiteFooter } from '@/components/home/site-footer';
import { SkipLink } from '@/components/home/skip-link';
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
import { usePageUrls } from '@/lib/site';
import type { PartnersPageProps } from '@/types/partners';

/** Program partnerski (/partnerzy, /en/partners): a page of its own, with its own header; the footer is the site's. */
export default function Partners({ faq }: PartnersPageProps) {
    const pageUrls = usePageUrls();
    useInPageAnchors();

    return (
        <MotionRoot>
            <SkipLink />
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
            <SiteFooter homeHref={pageUrls.home} />
        </MotionRoot>
    );
}
