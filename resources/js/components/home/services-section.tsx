import { AiTile } from '@/components/home/bento/ai-tile';
import { BackendTile } from '@/components/home/bento/backend-tile';
import { BentoStyles } from '@/components/home/bento/bento-styles';
import type { BentoService } from '@/components/home/bento/bento-tile';
import { DevopsTile } from '@/components/home/bento/devops-tile';
import { EcommerceTile } from '@/components/home/bento/ecommerce-tile';
import { MobileTile } from '@/components/home/bento/mobile-tile';
import { WebTile } from '@/components/home/bento/web-tile';
import { bleedClassName, Rivet, Section, SectionHeading } from '@/components/home/section';
import { localized, useCopy } from '@/lib/i18n';
import { useHomeSections } from '@/lib/sections';
import { cn } from '@/lib/utils';

type ServiceKey = 'web' | 'mobile' | 'ai' | 'backend' | 'devops' | 'ecommerce';

/** Technology tags, the same in both languages. */
const TAGS: Record<ServiceKey, string[]> = {
    web: ['React', 'Next.js', 'Vue.js', 'TypeScript'],
    mobile: ['React Native', 'Flutter', 'iOS', 'Android'],
    ai: ['OpenAI', 'LangChain', 'RAG', 'Agents'],
    backend: ['Node.js', 'Python', 'Go', 'GraphQL'],
    devops: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    ecommerce: ['Shopify', 'WooCommerce', 'Stripe', 'Headless'],
};

const COPY = localized({
    pl: {
        title: 'Co dla Ciebie zbudujemy',
        lead: 'Od koncepcji po wdrożenie. Budujemy skalowalne aplikacje webowe, mobilne i systemy dopasowane do tego, jak działa Twoja firma.',
        services: {
            web: {
                title: 'Aplikacje webowe',
                description: 'Nowoczesne aplikacje SPA i SSR, od prostych landing page po złożone platformy SaaS.',
                tags: TAGS.web,
            },
            mobile: {
                title: 'Aplikacje mobilne',
                description: 'Jeden kod na iOS i Android, pełna wydajność na obu platformach.',
                tags: TAGS.mobile,
            },
            ai: {
                title: 'AI & Automatyzacja',
                description: 'Chatboty, integracje z AI i automatyzacja procesów.',
                tags: TAGS.ai,
            },
            backend: {
                title: 'Systemy backend',
                description: 'Skalowalne API i mikroserwisy gotowe na wysokie obciążenia.',
                tags: TAGS.backend,
            },
            devops: {
                title: 'DevOps & Cloud',
                description: 'Infrastruktura jako kod, CI/CD, konteneryzacja i monitoring 24/7.',
                tags: TAGS.devops,
            },
            ecommerce: {
                title: 'E-commerce',
                description: 'Sklepy internetowe i marketplace’y z integracją płatności i fulfillmentu.',
                tags: TAGS.ecommerce,
            },
        } satisfies Record<ServiceKey, BentoService>,
    },
    en: {
        title: 'What we’ll build for you',
        lead: 'From concept to launch. We build scalable web and mobile apps and systems that fit the way your company works.',
        services: {
            web: {
                title: 'Web applications',
                description: 'Modern SPA and SSR apps, from simple landing pages to complex SaaS platforms.',
                tags: TAGS.web,
            },
            mobile: {
                title: 'Mobile apps',
                description: 'One codebase for iOS and Android, with full performance on both.',
                tags: TAGS.mobile,
            },
            ai: {
                title: 'AI & automation',
                description: 'Chatbots, AI integrations and process automation.',
                tags: TAGS.ai,
            },
            backend: {
                title: 'Backend systems',
                description: 'Scalable APIs and microservices built for heavy load.',
                tags: TAGS.backend,
            },
            devops: {
                title: 'DevOps & cloud',
                description: 'Infrastructure as code, CI/CD, containers and 24/7 monitoring.',
                tags: TAGS.devops,
            },
            ecommerce: {
                title: 'E-commerce',
                description: 'Online stores and marketplaces with payment and fulfillment integrations.',
                tags: TAGS.ecommerce,
            },
        },
    },
});

/**
 * Services as a live bento on the shared-border grid, rail to rail:
 *
 *   lg (4 columns)                      md (2 columns)        below md: one column, same order
 *   [ Web 2×2   ][ Mobile 1×2 ][ AI ]   [ Web 2×1         ]
 *   [ Web       ][ Mobile     ][ Be ]   [ Mobile ][ AI     ]
 *   [ DevOps 2×1 ][ E-commerce 2×1  ]   [ Backend ][ DevOps ]
 *                                       [ E-commerce 2×1  ]
 *
 * Tiles are placed by DOM order (auto-placement). Where a row hairline meets a rail, the tile below it carries the
 * rivet; the grid's top edge has its own pair and the bottom edge is the next section's hairline.
 */
export function ServicesSection() {
    const copy = useCopy(COPY);
    const id = useHomeSections().services;
    const services = copy.services;

    return (
        <Section id={id} labelledBy={`${id}-heading`} containerClassName="pb-0 md:pb-0">
            <SectionHeading id={`${id}-heading`} title={copy.title} lead={copy.lead} />

            <BentoStyles />

            {/* 1px gaps over bg-border draw the shared cell borders at any column count. */}
            <div className={cn('relative border-t border-border', bleedClassName)}>
                <Rivet side="left" />
                <Rivet side="right" />
                <ul className="grid gap-px bg-border md:grid-cols-2 lg:auto-rows-[minmax(20rem,auto)] lg:grid-cols-4">
                    <WebTile service={services.web} />
                    <MobileTile service={services.mobile} rivets={[{ side: 'left', className: 'lg:hidden' }]} />
                    <AiTile service={services.ai} rivets={[{ side: 'right', className: 'lg:hidden' }]} />
                    <BackendTile
                        service={services.backend}
                        rivets={[
                            { side: 'left', className: 'lg:hidden' },
                            { side: 'right', className: 'md:hidden lg:block' },
                        ]}
                    />
                    <DevopsTile
                        service={services.devops}
                        rivets={[
                            { side: 'right', className: 'lg:hidden' },
                            { side: 'left', className: 'md:hidden lg:block' },
                        ]}
                    />
                    <EcommerceTile service={services.ecommerce} rivets={[{ side: 'left', className: 'lg:hidden' }, { side: 'right' }]} />
                </ul>
            </div>
        </Section>
    );
}
