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
import { ProcessSection } from '@/components/home/process-section';
import { ProjectsSection } from '@/components/home/projects-section';
import { ServicesSection } from '@/components/home/services-section';
import { SiteFooter } from '@/components/home/site-footer';
import { SiteHeader } from '@/components/home/site-header';
import { MotionRoot } from '@/components/motion/motion-root';
import { useInPageAnchors } from '@/hooks/use-in-page-anchors';
import type { HomePageProps } from '@/types/home';

export default function Home({ projects, clients, faq }: HomePageProps) {
    useInPageAnchors();

    return (
        <MotionRoot>
            <HomeUiProvider>
                <a
                    href="#main-content"
                    className="sr-only rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    Przejdź do treści
                </a>
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
