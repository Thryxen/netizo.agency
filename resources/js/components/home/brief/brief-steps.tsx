import type { LucideIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    audienceOptions,
    type BriefField,
    type BriefFormData,
    type BriefOption,
    budgetOptions,
    contactPreferenceOptions,
    cooperationModelOptions,
    designOptions,
    featureGroups,
    hostingOptions,
    industryOptions,
    projectTypeOptions,
    securityOptions,
    sourceOptions,
    techOptions,
    timelineOptions,
} from './brief-options';
import { ChoiceCard, ChoiceChip, ChoiceFieldset, ChoiceGrid, toggleValue } from './choices';
import { errorIdFor, Field, FieldError, invalidProps, RequiredMark, SelectField } from './fields';

export type BriefStepProps = {
    data: BriefFormData;
    /** Error message per field (already resolved from `field` / `field.N` keys). */
    errors: Partial<Record<BriefField, string>>;
    setField: <K extends BriefField>(field: K, value: BriefFormData[K]) => void;
};

type ArrayField = { [K in BriefField]: BriefFormData[K] extends string[] ? K : never }[BriefField];
type StringField = { [K in BriefField]: BriefFormData[K] extends string ? K : never }[BriefField];

const fieldId = (field: BriefField): string => `brief-${field.replace('_', '-')}`;

type CardOption = BriefOption & { icon?: LucideIcon };

function CheckboxCards({ field, options, legend, props }: { field: ArrayField; options: CardOption[]; legend: string; props: BriefStepProps }) {
    const id = fieldId(field);
    const error = props.errors[field];
    const values = props.data[field];

    return (
        <ChoiceFieldset id={id} legend={legend} legendClassName="sr-only" error={error}>
            <ChoiceGrid className="lg:grid-cols-3">
                {options.map((option) => (
                    <ChoiceCard
                        key={option.value}
                        type="checkbox"
                        id={`${id}-${option.value}`}
                        name={`${field}[]`}
                        value={option.value}
                        label={option.label}
                        description={option.description}
                        icon={option.icon}
                        checked={values.includes(option.value)}
                        onCheckedChange={(checked) => props.setField(field, toggleValue(values, option.value, checked))}
                        invalid={Boolean(error)}
                        describedBy={error ? errorIdFor(id) : undefined}
                    />
                ))}
            </ChoiceGrid>
        </ChoiceFieldset>
    );
}

function RadioCards({ field, options, legend, gridClassName, props }: { field: StringField; options: BriefOption[]; legend: string; gridClassName?: string; props: BriefStepProps }) {
    const id = fieldId(field);
    const error = props.errors[field];

    return (
        <ChoiceFieldset id={id} legend={legend} hint="Wybierz jedną opcję." error={error}>
            <ChoiceGrid className={gridClassName}>
                {options.map((option) => (
                    <ChoiceCard
                        key={option.value}
                        type="radio"
                        id={`${id}-${option.value}`}
                        name={field}
                        value={option.value}
                        label={option.label}
                        description={option.description}
                        checked={props.data[field] === option.value}
                        onCheckedChange={(checked) => checked && props.setField(field, option.value)}
                        invalid={Boolean(error)}
                        describedBy={error ? errorIdFor(id) : undefined}
                    />
                ))}
            </ChoiceGrid>
        </ChoiceFieldset>
    );
}

function CheckboxChips({ field, options, legend, idSuffix = '', props }: { field: ArrayField; options: BriefOption[]; legend: string; idSuffix?: string; props: BriefStepProps }) {
    const id = `${fieldId(field)}${idSuffix}`;
    const error = props.errors[field];
    const values = props.data[field];

    return (
        <ChoiceFieldset id={id} legend={legend} error={idSuffix === '' ? error : undefined}>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <ChoiceChip
                        key={option.value}
                        type="checkbox"
                        id={`${fieldId(field)}-${option.value}`}
                        name={`${field}[]`}
                        value={option.value}
                        label={option.label}
                        checked={values.includes(option.value)}
                        onCheckedChange={(checked) => props.setField(field, toggleValue(values, option.value, checked))}
                        invalid={Boolean(error)}
                        describedBy={error ? errorIdFor(fieldId(field)) : undefined}
                    />
                ))}
            </div>
        </ChoiceFieldset>
    );
}

function BriefSelect({ field, label, placeholder, options, props }: { field: StringField; label: string; placeholder: string; options: BriefOption[]; props: BriefStepProps }) {
    return (
        <SelectField
            fieldId={fieldId(field)}
            label={label}
            placeholder={placeholder}
            options={options}
            value={props.data[field]}
            onValueChange={(value) => props.setField(field, value)}
            error={props.errors[field]}
        />
    );
}

function BriefTextarea({ field, label, placeholder, props }: { field: 'integrations' | 'notes'; label: string; placeholder: string; props: BriefStepProps }) {
    const id = fieldId(field);
    const error = props.errors[field];

    return (
        <Field fieldId={id} label={label} error={error}>
            <Textarea
                id={id}
                name={field}
                rows={4}
                maxLength={5000}
                placeholder={placeholder}
                value={props.data[field]}
                onChange={(event) => props.setField(field, event.target.value)}
                className="min-h-28"
                {...invalidProps(id, error)}
            />
        </Field>
    );
}

type TextInputConfig = {
    field: 'name' | 'email' | 'phone' | 'company' | 'position' | 'website';
    label: string;
    type: 'text' | 'email' | 'tel' | 'url';
    autoComplete: string;
    placeholder: string;
    required?: boolean;
};

const contactInputs: TextInputConfig[] = [
    { field: 'name', label: 'Imię i nazwisko', type: 'text', autoComplete: 'name', placeholder: 'Jan Kowalski', required: true },
    { field: 'email', label: 'E-mail', type: 'email', autoComplete: 'email', placeholder: 'jan@firma.pl', required: true },
    { field: 'phone', label: 'Telefon', type: 'tel', autoComplete: 'tel', placeholder: '+48 000 000 000' },
    { field: 'company', label: 'Firma', type: 'text', autoComplete: 'organization', placeholder: 'Nazwa firmy' },
    { field: 'position', label: 'Stanowisko', type: 'text', autoComplete: 'organization-title', placeholder: 'CEO, CTO, PM…' },
    { field: 'website', label: 'Strona WWW', type: 'url', autoComplete: 'url', placeholder: 'https://…' },
];

/** Step 1 — project types. */
export function ProjectTypeStep(props: BriefStepProps) {
    return <CheckboxCards field="types" options={projectTypeOptions} legend="Typ projektu" props={props} />;
}

/** Step 2 — features, grouped chips. */
export function FeaturesStep(props: BriefStepProps) {
    const error = props.errors.features;

    return (
        <div className="grid gap-7">
            {featureGroups.map((group, index) => (
                <CheckboxChips key={group.title} field="features" options={group.options} legend={group.title} idSuffix={`-group-${index}`} props={props} />
            ))}
            <FieldError fieldId={fieldId('features')} message={error} />
        </div>
    );
}

/** Step 3 — industry, audience, design, timeline. */
export function DetailsStep(props: BriefStepProps) {
    return (
        <div className="grid gap-8">
            <div className="grid gap-5 sm:grid-cols-2">
                <BriefSelect field="industry" label="Branża" placeholder="Wybierz branżę…" options={industryOptions} props={props} />
                <BriefSelect field="audience" label="Grupa docelowa" placeholder="Wybierz grupę…" options={audienceOptions} props={props} />
            </div>
            <RadioCards field="design" legend="Czy masz projekt graficzny?" options={designOptions} gridClassName="sm:grid-cols-3" props={props} />
            <RadioCards field="timeline" legend="Oczekiwany termin" options={timelineOptions} gridClassName="sm:grid-cols-2 xl:grid-cols-4" props={props} />
        </div>
    );
}

/** Step 4 — technologies, security, hosting, integrations. */
export function TechStep(props: BriefStepProps) {
    return (
        <div className="grid gap-8">
            <CheckboxChips field="tech" options={techOptions} legend="Preferowane technologie" props={props} />
            <div className="grid gap-5 sm:grid-cols-2">
                <BriefSelect field="security" label="Bezpieczeństwo" placeholder="Wybierz poziom…" options={securityOptions} props={props} />
                <BriefSelect field="hosting" label="Hosting" placeholder="Wybierz opcję…" options={hostingOptions} props={props} />
            </div>
            <BriefTextarea field="integrations" label="Integracje zewnętrzne (opcjonalnie)" placeholder="Np. systemy ERP, CRM, bramki płatności, API…" props={props} />
        </div>
    );
}

/** Step 5 — budget, cooperation model, notes. */
export function BudgetStep(props: BriefStepProps) {
    return (
        <div className="grid gap-8">
            {/* Five options: 2 + 2 + a full-width "Do ustalenia" from sm; a row of 3, then 2 wider cards from lg. */}
            <RadioCards
                field="budget"
                legend="Budżet"
                options={budgetOptions}
                gridClassName="sm:grid-cols-2 sm:[&>*:last-child]:col-span-2 lg:grid-cols-6 lg:*:col-span-2 lg:[&>*:nth-child(n+4)]:col-span-3 lg:[&>*:last-child]:col-span-3"
                props={props}
            />
            <RadioCards field="cooperation_model" legend="Model współpracy" options={cooperationModelOptions} gridClassName="sm:grid-cols-3" props={props} />
            <BriefTextarea field="notes" label="Dodatkowe informacje (opcjonalnie)" placeholder="Opisz swoją wizję, cele biznesowe, pytania…" props={props} />
        </div>
    );
}

/** Step 6 — contact details, source, contact preference, privacy consent. */
export function ContactStep(props: BriefStepProps) {
    const { data, errors, setField } = props;
    const privacyId = fieldId('privacy');

    return (
        <div className="grid gap-8">
            <div className="grid gap-5 sm:grid-cols-2">
                {contactInputs.map((input) => {
                    const id = fieldId(input.field);
                    const error = errors[input.field];

                    return (
                        <Field key={input.field} fieldId={id} label={input.label} required={input.required} error={error}>
                            <Input
                                id={id}
                                name={input.field}
                                type={input.type}
                                autoComplete={input.autoComplete}
                                inputMode={input.type === 'text' ? undefined : input.type}
                                placeholder={input.placeholder}
                                maxLength={255}
                                value={data[input.field]}
                                onChange={(event) => setField(input.field, event.target.value)}
                                aria-required={input.required || undefined}
                                {...invalidProps(id, error)}
                            />
                        </Field>
                    );
                })}
            </div>

            <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2">
                <BriefSelect field="source" label="Skąd o nas wiesz?" placeholder="Wybierz…" options={sourceOptions} props={props} />
                <CheckboxChips field="contact_pref" options={contactPreferenceOptions} legend="Preferowany kontakt" props={props} />
            </div>

            <div className="grid gap-2">
                <div className="flex items-start gap-3">
                    <Checkbox
                        id={privacyId}
                        name="privacy"
                        checked={data.privacy}
                        onCheckedChange={(checked) => setField('privacy', checked === true)}
                        aria-required="true"
                        className="mt-0.5"
                        {...invalidProps(privacyId, errors.privacy)}
                    />
                    <Label htmlFor={privacyId} className="block leading-snug font-normal">
                        Akceptuję{' '}
                        <a
                            href="/polityka-prywatnosci"
                            target="_blank"
                            rel="noopener"
                            className="rounded-sm font-medium underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                            politykę prywatności
                        </a>{' '}
                        i wyrażam zgodę na kontakt w sprawie zapytania. <RequiredMark />
                    </Label>
                </div>
                <FieldError fieldId={privacyId} message={errors.privacy} className="pl-7" />
            </div>

            <p className="text-sm text-muted-foreground">
                Pola oznaczone <span aria-hidden="true">*</span>
                <span className="sr-only">gwiazdką</span> są wymagane.
            </p>
        </div>
    );
}
