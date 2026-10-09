import { CallbackDialog } from '@/components/home/callback-dialog';
import { CallbackFab } from '@/components/home/callback-fab';
import { ClientsSection } from '@/components/home/clients-section';
import { ContactSection } from '@/components/home/contact-section';
import { FaqSection } from '@/components/home/faq-section';
import { Hero } from '@/components/home/hero';
import { HomeUiProvider } from '@/components/home/home-ui-context';
import { MissionSection } from '@/components/home/mission-section';
import { NewsletterSection } from '@/components/home/newsletter-section';
import { PanelSection } from '@/components/home/panel-section';
import { PartnerCtaSection } from '@/components/home/partner-cta-section';
import { ProcessSection } from '@/components/home/process-section';
import { ProjectsSection } from '@/components/home/projects-section';
import { ServicesSection } from '@/components/home/services-section';
import { SiteFooter } from '@/components/home/site-footer';
import { SkipLink } from '@/components/home/skip-link';
import { SiteHeader } from '@/components/home/site-header';
import { MotionRoot } from '@/components/motion/motion-root';
import { useInPageAnchors } from '@/hooks/use-in-page-anchors';
import type { HomePageProps } from '@/types/home';

export default function Home({ projects, clients, faq }: HomePageProps) {
    useInPageAnchors();

    return (
        <MotionRoot>
            <HomeUiProvider>
                <SkipLink />
                <SiteHeader />
                <main id="main-content" tabIndex={-1} className="outline-none">
                    <Hero />
                    <ServicesSection />
                    <ProjectsSection projects={projects} />
                    <MissionSection />
                    <ClientsSection clients={clients} />
                    <ProcessSection />
                    <PanelSection />
                    <FaqSection faq={faq} />
                    <PartnerCtaSection />
                    <NewsletterSection />
                    <ContactSection />
                </main>
                <SiteFooter />
                <CallbackFab />
                <CallbackDialog />
            </HomeUiProvider>
        </MotionRoot>
    );
}
