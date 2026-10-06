import { AiTile } from '@/components/home/bento/ai-tile';
import { BackendTile } from '@/components/home/bento/backend-tile';
import { BentoStyles } from '@/components/home/bento/bento-styles';
import type { BentoService } from '@/components/home/bento/bento-tile';
import { DevopsTile } from '@/components/home/bento/devops-tile';
import { EcommerceTile } from '@/components/home/bento/ecommerce-tile';
import { MobileTile } from '@/components/home/bento/mobile-tile';
import { WebTile } from '@/components/home/bento/web-tile';
import { bleedClassName, Rivet, Section, SectionHeading } from '@/components/home/section';
import { cn } from '@/lib/utils';

const SERVICES = {
    web: {
        title: 'Aplikacje webowe',
        description: 'Nowoczesne aplikacje SPA i SSR, od prostych landing page po złożone platformy SaaS.',
        tags: ['React', 'Next.js', 'Vue.js', 'TypeScript'],
    },
    mobile: {
        title: 'Aplikacje mobilne',
        description: 'Jeden kod na iOS i Android, pełna wydajność na obu platformach.',
        tags: ['React Native', 'Flutter', 'iOS', 'Android'],
    },
    ai: {
        title: 'AI & Automatyzacja',
        description: 'Chatboty, integracje z AI i automatyzacja procesów.',
        tags: ['OpenAI', 'LangChain', 'RAG', 'Agents'],
    },
    backend: {
        title: 'Systemy backend',
        description: 'Skalowalne API i mikroserwisy gotowe na wysokie obciążenia.',
        tags: ['Node.js', 'Python', 'Go', 'GraphQL'],
    },
    devops: {
        title: 'DevOps & Cloud',
        description: 'Infrastruktura jako kod, CI/CD, konteneryzacja i monitoring 24/7.',
        tags: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    },
    ecommerce: {
        title: 'E-commerce',
        description: 'Sklepy internetowe i marketplace’y z integracją płatności i fulfillmentu.',
        tags: ['Shopify', 'WooCommerce', 'Stripe', 'Headless'],
    },
} satisfies Record<string, BentoService>;

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
    return (
        <Section id="uslugi" labelledBy="uslugi-heading" containerClassName="pb-0 md:pb-0">
            <SectionHeading
                id="uslugi-heading"
                title="Co dla Ciebie zbudujemy"
                lead="Od koncepcji po wdrożenie. Budujemy skalowalne aplikacje webowe, mobilne i systemy dopasowane do tego, jak działa Twoja firma."
            />

            <BentoStyles />

            {/* 1px gaps over bg-border draw the shared cell borders at any column count. */}
            <div className={cn('relative border-t border-border', bleedClassName)}>
                <Rivet side="left" />
                <Rivet side="right" />
                <ul className="grid gap-px bg-border md:grid-cols-2 lg:auto-rows-[minmax(20rem,auto)] lg:grid-cols-4">
                    <WebTile service={SERVICES.web} />
                    <MobileTile service={SERVICES.mobile} rivets={[{ side: 'left', className: 'lg:hidden' }]} />
                    <AiTile service={SERVICES.ai} rivets={[{ side: 'right', className: 'lg:hidden' }]} />
                    <BackendTile
                        service={SERVICES.backend}
                        rivets={[
                            { side: 'left', className: 'lg:hidden' },
                            { side: 'right', className: 'md:hidden lg:block' },
                        ]}
                    />
                    <DevopsTile
                        service={SERVICES.devops}
                        rivets={[
                            { side: 'right', className: 'lg:hidden' },
                            { side: 'left', className: 'md:hidden lg:block' },
                        ]}
                    />
                    <EcommerceTile service={SERVICES.ecommerce} rivets={[{ side: 'left', className: 'lg:hidden' }, { side: 'right' }]} />
                </ul>
            </div>
        </Section>
    );
}
