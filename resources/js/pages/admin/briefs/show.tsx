import { Link, router } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { briefLabel, briefLabels } from '@/components/admin/brief-labels';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { CopyButton, DetailItem, DetailList } from '@/components/admin/detail';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminBrief } from '@/types/admin';

const websiteUrl = (website: string): string => (/^https?:\/\//i.test(website) ? website : `https://${website}`);

export default function BriefShow({ brief }: { brief: AdminBrief }) {
    const [confirming, setConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);

    return (
        <AdminLayout
            title={brief.name}
            breadcrumbs={[{ title: 'Briefy', href: adminRoutes.briefs.index }]}
            actions={
                <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
                    <Trash2Icon />
                    Usuń
                </Button>
            }
        >
            <div className="grid max-w-4xl grid-cols-[minmax(0,1fr)] gap-6">
                <Tabs defaultValue="contact">
                    <TabsList className="max-w-full justify-start overflow-x-auto">
                        <TabsTrigger value="contact">Dane kontaktowe</TabsTrigger>
                        <TabsTrigger value="project">Projekt</TabsTrigger>
                        <TabsTrigger value="tech">Technologia</TabsTrigger>
                        <TabsTrigger value="budget">Budżet</TabsTrigger>
                    </TabsList>

                    <TabsContent value="contact" className="pt-4">
                        <DetailList>
                            <DetailItem label="Imię i nazwisko">{brief.name}</DetailItem>
                            <DetailItem label="E-mail">
                                <span className="inline-flex items-center gap-1">
                                    <a href={`mailto:${brief.email}`} className="underline-offset-4 hover:underline">
                                        {brief.email}
                                    </a>
                                    <CopyButton value={brief.email} label="adres e-mail" />
                                </span>
                            </DetailItem>
                            <DetailItem label="Telefon">
                                {brief.phone ? (
                                    <span className="inline-flex items-center gap-1">
                                        <a href={`tel:${brief.phone.replace(/\s+/g, '')}`} className="underline-offset-4 hover:underline">
                                            {brief.phone}
                                        </a>
                                        <CopyButton value={brief.phone} label="numer telefonu" />
                                    </span>
                                ) : null}
                            </DetailItem>
                            <DetailItem label="Firma">{brief.company}</DetailItem>
                            <DetailItem label="Stanowisko">{brief.position}</DetailItem>
                            <DetailItem label="Strona WWW">
                                {brief.website ? (
                                    <a href={websiteUrl(brief.website)} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                                        {brief.website}
                                    </a>
                                ) : null}
                            </DetailItem>
                            <DetailItem label="Skąd o nas">{briefLabel('source', brief.source)}</DetailItem>
                            <DetailItem label="Preferowany kontakt">{briefLabels('contact_pref', brief.contactPref)}</DetailItem>
                            <DetailItem label="Data wysłania">{brief.createdAt}</DetailItem>
                        </DetailList>
                    </TabsContent>

                    <TabsContent value="project" className="pt-4">
                        <DetailList>
                            <DetailItem label="Typy projektu" empty="Nie wybrano">
                                {briefLabels('types', brief.types)}
                            </DetailItem>
                            <DetailItem label="Funkcjonalności" empty="Nie wybrano">
                                {briefLabels('features', brief.features)}
                            </DetailItem>
                            <DetailItem label="Branża">{briefLabel('industry', brief.industry)}</DetailItem>
                            <DetailItem label="Grupa docelowa">{briefLabel('audience', brief.audience)}</DetailItem>
                            <DetailItem label="Projekt graficzny">{briefLabel('design', brief.design)}</DetailItem>
                            <DetailItem label="Termin realizacji">{briefLabel('timeline', brief.timeline)}</DetailItem>
                        </DetailList>
                    </TabsContent>

                    <TabsContent value="tech" className="pt-4">
                        <DetailList>
                            <DetailItem label="Technologie" empty="Nie wybrano">
                                {briefLabels('tech', brief.tech)}
                            </DetailItem>
                            <DetailItem label="Bezpieczeństwo">{briefLabel('security', brief.security)}</DetailItem>
                            <DetailItem label="Hosting">{briefLabel('hosting', brief.hosting)}</DetailItem>
                            <DetailItem label="Integracje">{brief.integrations}</DetailItem>
                        </DetailList>
                    </TabsContent>

                    <TabsContent value="budget" className="pt-4">
                        <DetailList>
                            <DetailItem label="Budżet">{briefLabel('budget', brief.budget)}</DetailItem>
                            <DetailItem label="Model współpracy">{briefLabel('cooperation_model', brief.cooperationModel)}</DetailItem>
                            <DetailItem label="Dodatkowe uwagi" empty="Brak uwag" className="sm:col-span-2">
                                {brief.notes}
                            </DetailItem>
                        </DetailList>
                    </TabsContent>
                </Tabs>

                <div>
                    <Button asChild variant="ghost">
                        <Link href={adminRoutes.briefs.index}>Wróć do listy</Link>
                    </Button>
                </div>
            </div>

            <ConfirmDeleteDialog
                open={confirming}
                onOpenChange={setConfirming}
                title="Usunąć brief?"
                description={`Brief od ${brief.name} zostanie usunięty. Tej operacji nie można cofnąć.`}
                processing={processing}
                onConfirm={() =>
                    router.delete(adminRoutes.briefs.destroy(brief.id), {
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                    })
                }
            />
        </AdminLayout>
    );
}
