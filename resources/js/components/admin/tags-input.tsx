import { XIcon } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

import { Badge } from '@/components/ui/badge';

type TagsInputProps = {
    id: string;
    value: string[];
    onChange: (value: string[]) => void;
    suggestions?: string[];
    placeholder?: string;
    invalid?: boolean;
};

/** Free-text tags: Enter or a comma adds the typed one, Backspace on an empty field removes the last. */
export function TagsInput({ id, value, onChange, suggestions = [], placeholder, invalid = false }: TagsInputProps) {
    const [draft, setDraft] = useState('');
    const listId = `${id}-suggestions`;

    const add = (raw: string): void => {
        const tag = raw.trim();

        setDraft('');

        if (tag === '' || value.some((item) => item.toLowerCase() === tag.toLowerCase())) {
            return;
        }

        onChange([...value, tag]);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            add(draft);

            return;
        }

        if (event.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    return (
        <div
            className="flex flex-wrap items-center gap-1.5 rounded-md border border-input p-1.5 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 aria-invalid:border-destructive dark:bg-input/12"
            aria-invalid={invalid}
        >
            {value.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                        type="button"
                        className="rounded-sm p-0.5 hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label={`Usuń: ${tag}`}
                        onClick={() => onChange(value.filter((item) => item !== tag))}
                    >
                        <XIcon className="size-3" />
                    </button>
                </Badge>
            ))}
            <input
                id={id}
                list={listId}
                className="min-w-40 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
                value={draft}
                placeholder={value.length === 0 ? placeholder : undefined}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => add(draft)}
            />
            <datalist id={listId}>
                {suggestions
                    .filter((suggestion) => !value.some((item) => item.toLowerCase() === suggestion.toLowerCase()))
                    .map((suggestion) => (
                        <option key={suggestion} value={suggestion} />
                    ))}
            </datalist>
        </div>
    );
}
