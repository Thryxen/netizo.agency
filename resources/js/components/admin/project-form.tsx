import { Link, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

import { FormField } from '@/components/admin/form-field';
import { ImageField } from '@/components/admin/image-field';
import { RepeaterList } from '@/components/admin/repeater-list';
import { TagsInput } from '@/components/admin/tags-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminProject } from '@/types/admin';

const TECH_SUGGESTIONS = [
    'React', 'Vue.js', 'Next.js', 'Nuxt.js', 'Angular', 'Laravel', 'PHP', 'Node.js', 'Python', 'Django',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'AWS', 'Vercel', 'Docker', 'Kubernetes', 'GraphQL',
    'REST API', 'WebSocket', 'Tailwind CSS', 'TypeScript', 'JavaScript',
];

type TabKey = 'basic' | 'images' | 'tech' | 'metrics' | 'story';

const TABS: { key: TabKey; label: string; fields: string[] }[] = [
    { key: 'basic', label: 'Podstawowe', fields: ['title', 'slug', 'url', 'category', 'sort_order', 'is_active', 'description', 'full_description'] },
    { key: 'images', label: 'Zdjęcia', fields: ['thumbnail_image', 'full_image'] },
    { key: 'tech', label: 'Technologie', fields: ['tech_stack'] },
    { key: 'metrics', label: 'Metryki', fields: ['metrics'] },
    { key: 'story', label: 'Wyzwania i rozwiązania', fields: ['challenges', 'solutions'] },
];

type Metric = { value: string; label: string };

type ProjectFormData = {
    title: string;
    slug: string;
    url: string;
    category: string;
    sort_order: number;
    is_active: boolean;
    description: string;
    full_description: string;
    thumbnail_image: File | null;
    full_image: File | null;
    remove_thumbnail_image: boolean;
    remove_full_image: boolean;
    tech_stack: string[];
    metrics: Metric[];
    challenges: string[];
    solutions: string[];
};

const blankMetrics = (count: number): Metric[] => Array.from({ length: count }, () => ({ value: '', label: '' }));
const blankTexts = (count: number): string[] => Array.from({ length: count }, () => '');

/** Lower-case ASCII slug; "ł" has no decomposition, so it is mapped by hand. */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/ł/g, 'l')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const hasError = (errors: Record<string, string>, fields: string[]): boolean =>
    Object.keys(errors).some((key) => fields.some((field) => key === field || key.startsWith(`${field}.`)));

const firstError = (errors: Record<string, string>, field: string): string | undefined => {
    const key = Object.keys(errors).find((name) => name === field || name.startsWith(`${field}.`));

    return key ? errors[key] : undefined;
};

type ProjectFormProps = {
    project?: AdminProject;
    nextSortOrder?: number;
};

export function ProjectForm({ project, nextSortOrder = 1 }: ProjectFormProps) {
    const [tab, setTab] = useState<TabKey>('basic');
    const [slugEdited, setSlugEdited] = useState(Boolean(project));

    const { data, setData, post, processing, errors, transform } = useForm<ProjectFormData>({
        title: project?.title ?? '',
        slug: project?.slug ?? '',
        url: project?.url ?? '',
        category: project?.category ?? '',
        sort_order: project?.sortOrder ?? nextSortOrder,
        is_active: project?.isActive ?? true,
        description: project?.description ?? '',
        full_description: project?.fullDescription ?? '',
        thumbnail_image: null,
        full_image: null,
        remove_thumbnail_image: false,
        remove_full_image: false,
        tech_stack: project?.techStack ?? [],
        metrics: project?.metrics ?? blankMetrics(3),
        challenges: project?.challenges ?? blankTexts(4),
        solutions: project?.solutions ?? blankTexts(4),
    });

    // Rows the user left blank are dropped, so the default empty rows do not block saving. An edit is sent as a
    // POST with a spoofed method: PHP only parses a real multipart PUT body from 8.4 on.
    transform((form) => ({
        ...form,
        ...(project ? { _method: 'put' } : {}),
        tech_stack: form.tech_stack.filter((tag) => tag.trim() !== ''),
        metrics: form.metrics.filter((metric) => metric.value.trim() !== '' || metric.label.trim() !== ''),
        challenges: form.challenges.filter((text) => text.trim() !== ''),
        solutions: form.solutions.filter((text) => text.trim() !== ''),
    }));

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const options = {
            forceFormData: true,
            onError: (formErrors: Record<string, string>) => {
                const failing = TABS.find((candidate) => hasError(formErrors, candidate.fields));

                if (failing) {
                    setTab(failing.key);
                }
            },
        };

        post(project ? adminRoutes.projects.update(project.id) : adminRoutes.projects.index, options);
    };

    const changeTitle = (title: string): void => {
        setData((current) => ({ ...current, title, slug: slugEdited ? current.slug : slugify(title) }));
    };

    return (
        <form onSubmit={submit} className="grid max-w-4xl grid-cols-[minmax(0,1fr)] gap-6" noValidate>
            <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
                <TabsList className="max-w-full justify-start overflow-x-auto">
                    {TABS.map((candidate) => (
                        <TabsTrigger key={candidate.key} value={candidate.key} className="gap-2">
                            {candidate.label}
                            {hasError(errors, candidate.fields) ? <span className="size-1.5 rounded-full bg-destructive" role="img" aria-label="Są błędy" /> : null}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="basic" className="grid gap-6 pt-4">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Nazwa projektu" htmlFor="title" error={errors.title}>
                            <Input id="title" required value={data.title} aria-invalid={Boolean(errors.title)} onChange={(event) => changeTitle(event.target.value)} />
                        </FormField>
                        <FormField label="Slug (URL)" htmlFor="slug" error={errors.slug}>
                            <Input
                                id="slug"
                                required
                                value={data.slug}
                                aria-invalid={Boolean(errors.slug)}
                                onChange={(event) => {
                                    setSlugEdited(true);
                                    setData('slug', event.target.value);
                                }}
                            />
                        </FormField>
                        <FormField label="Adres URL projektu" htmlFor="url" error={errors.url}>
                            <Input id="url" required placeholder="example.com" value={data.url} aria-invalid={Boolean(errors.url)} onChange={(event) => setData('url', event.target.value)} />
                        </FormField>
                        <FormField label="Kategoria" htmlFor="category" error={errors.category}>
                            <Input
                                id="category"
                                required
                                placeholder="np. E-commerce / Headless CMS"
                                value={data.category}
                                aria-invalid={Boolean(errors.category)}
                                onChange={(event) => setData('category', event.target.value)}
                            />
                        </FormField>
                        <FormField label="Kolejność" htmlFor="sort_order" error={errors.sort_order} hint="Mniejsza liczba oznacza wyższą pozycję na liście.">
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                value={data.sort_order}
                                aria-invalid={Boolean(errors.sort_order)}
                                onChange={(event) => setData('sort_order', Number(event.target.value))}
                            />
                        </FormField>
                        <div className="flex items-center gap-3 sm:pt-7">
                            <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                            <Label htmlFor="is_active">Widoczny na stronie</Label>
                        </div>
                    </div>
                    <FormField label="Krótki opis" htmlFor="description" error={errors.description} hint="Wyświetlany na stronie głównej pod projektem.">
                        <Textarea id="description" rows={3} required value={data.description} aria-invalid={Boolean(errors.description)} onChange={(event) => setData('description', event.target.value)} />
                    </FormField>
                    <FormField label="Pełny opis" htmlFor="full_description" error={errors.full_description} hint="Wyświetlany w oknie case study.">
                        <Textarea
                            id="full_description"
                            rows={6}
                            required
                            value={data.full_description}
                            aria-invalid={Boolean(errors.full_description)}
                            onChange={(event) => setData('full_description', event.target.value)}
                        />
                    </FormField>
                </TabsContent>

                <TabsContent value="images" className="grid gap-6 pt-4">
                    <p className="text-sm text-muted-foreground">Zdjęcia są zamieniane na WebP i zmniejszane do 1600 px (miniaturka) i 1920 px (pełne zdjęcie) szerokości.</p>
                    <FormField label="Miniaturka (strona główna)" htmlFor="thumbnail_image" error={errors.thumbnail_image}>
                        <ImageField
                            id="thumbnail_image"
                            currentUrl={project?.thumbnailUrl ?? null}
                            file={data.thumbnail_image}
                            removed={data.remove_thumbnail_image}
                            invalid={Boolean(errors.thumbnail_image)}
                            onFileChange={(file) => setData('thumbnail_image', file)}
                            onRemovedChange={(removed) => setData('remove_thumbnail_image', removed)}
                        />
                    </FormField>
                    <FormField label="Pełne zdjęcie (okno case study)" htmlFor="full_image" error={errors.full_image}>
                        <ImageField
                            id="full_image"
                            currentUrl={project?.fullImageUrl ?? null}
                            file={data.full_image}
                            removed={data.remove_full_image}
                            invalid={Boolean(errors.full_image)}
                            onFileChange={(file) => setData('full_image', file)}
                            onRemovedChange={(removed) => setData('remove_full_image', removed)}
                        />
                    </FormField>
                </TabsContent>

                <TabsContent value="tech" className="grid gap-6 pt-4">
                    <FormField label="Technologie" htmlFor="tech_stack" error={firstError(errors, 'tech_stack')} hint="Wpisz nazwę i zatwierdź Enterem.">
                        <TagsInput
                            id="tech_stack"
                            value={data.tech_stack}
                            onChange={(tags) => setData('tech_stack', tags)}
                            suggestions={TECH_SUGGESTIONS}
                            placeholder="Dodaj technologię"
                            invalid={Boolean(firstError(errors, 'tech_stack'))}
                        />
                    </FormField>
                </TabsContent>

                <TabsContent value="metrics" className="grid gap-4 pt-4">
                    <p className="text-sm text-muted-foreground">Od 1 do 3 kluczowych metryk projektu.</p>
                    <RepeaterList<Metric>
                        value={data.metrics}
                        onChange={(metrics) => setData('metrics', metrics)}
                        createItem={() => ({ value: '', label: '' })}
                        addLabel="Dodaj metrykę"
                        itemLabel="Metryki"
                        min={1}
                        max={3}
                        error={firstError(errors, 'metrics')}
                        renderItem={(metric, update, index) => (
                            <div className="grid gap-2 sm:grid-cols-2">
                                <Input aria-label={`Wartość metryki ${index + 1}`} placeholder="np. +45%, 99.9%, 10K+" value={metric.value} onChange={(event) => update({ ...metric, value: event.target.value })} />
                                <Input aria-label={`Etykieta metryki ${index + 1}`} placeholder="np. Konwersja, Uptime" value={metric.label} onChange={(event) => update({ ...metric, label: event.target.value })} />
                            </div>
                        )}
                    />
                </TabsContent>

                <TabsContent value="story" className="grid gap-8 pt-4">
                    <div className="grid gap-2">
                        <h2 className="text-sm font-medium">Wyzwania</h2>
                        <RepeaterList<string>
                            value={data.challenges}
                            onChange={(challenges) => setData('challenges', challenges)}
                            createItem={() => ''}
                            addLabel="Dodaj wyzwanie"
                            itemLabel="Wyzwania"
                            min={1}
                            max={6}
                            error={firstError(errors, 'challenges')}
                            renderItem={(text, update, index) => <Input aria-label={`Wyzwanie ${index + 1}`} placeholder="Opisz wyzwanie" value={text} onChange={(event) => update(event.target.value)} />}
                        />
                    </div>
                    <div className="grid gap-2">
                        <h2 className="text-sm font-medium">Rozwiązania</h2>
                        <RepeaterList<string>
                            value={data.solutions}
                            onChange={(solutions) => setData('solutions', solutions)}
                            createItem={() => ''}
                            addLabel="Dodaj rozwiązanie"
                            itemLabel="Rozwiązania"
                            min={1}
                            max={6}
                            error={firstError(errors, 'solutions')}
                            renderItem={(text, update, index) => <Input aria-label={`Rozwiązanie ${index + 1}`} placeholder="Opisz rozwiązanie" value={text} onChange={(event) => update(event.target.value)} />}
                        />
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing}>
                    {project ? 'Zapisz zmiany' : 'Dodaj projekt'}
                </Button>
                <Button asChild variant="ghost">
                    <Link href={adminRoutes.projects.index}>Anuluj</Link>
                </Button>
            </div>
        </form>
    );
}
