import { ImageIcon, RotateCcwIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

type ImageFieldProps = {
    id: string;
    currentUrl: string | null;
    file: File | null;
    removed: boolean;
    onFileChange: (file: File | null) => void;
    onRemovedChange: (removed: boolean) => void;
    invalid?: boolean;
};

/** Upload field with a preview: a newly chosen file, the current image, or the removal of the current image. */
export function ImageField({ id, currentUrl, file, removed, onFileChange, onRemovedChange, invalid = false }: ImageFieldProps) {
    const input = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);

            return;
        }

        const url = URL.createObjectURL(file);

        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    const shown = preview ?? (removed ? null : currentUrl);

    return (
        <div className="grid gap-3">
            <div
                className="flex aspect-video w-full max-w-md items-center justify-center overflow-hidden rounded-md border bg-muted data-[invalid=true]:border-destructive"
                data-invalid={invalid}
            >
                {shown ? (
                    <img src={shown} alt="" className="size-full object-cover object-top" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="size-6" />
                        {removed ? 'Zdjęcie zostanie usunięte po zapisaniu' : 'Brak zdjęcia'}
                    </div>
                )}
            </div>

            <input
                ref={input}
                id={id}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                    const chosen = event.target.files?.[0] ?? null;

                    onFileChange(chosen);

                    if (chosen) {
                        onRemovedChange(false);
                    }

                    event.target.value = '';
                }}
            />

            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
                    <UploadIcon />
                    {file || currentUrl ? 'Zmień plik' : 'Wybierz plik'}
                </Button>
                {file ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onFileChange(null)}>
                        <RotateCcwIcon />
                        Cofnij wybór
                    </Button>
                ) : currentUrl && !removed ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemovedChange(true)}>
                        <Trash2Icon />
                        Usuń zdjęcie
                    </Button>
                ) : null}
                {removed && !file ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemovedChange(false)}>
                        <RotateCcwIcon />
                        Przywróć zdjęcie
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
