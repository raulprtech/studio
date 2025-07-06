"use client";

import { useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";

function toTitleCase(str: string) {
    if (!str) return '';
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str) { return str.toUpperCase(); })
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
        </Button>
    );
}

export function EditDocumentForm({ collectionId, document }: { collectionId: string, document: any }) {
    const { toast } = useToast();
    const initialState = { message: null, success: false };
    const [state, dispatch] = useActionState(updateDocumentAction, initialState);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Éxito" : "Error",
                description: state.message,
                variant: state.success ? "default" : "destructive",
            });
        }
    }, [state, toast]);

    const renderField = (field: string, value: any) => {
        const fieldId = `${collectionId}-${field}`;
        const title = toTitleCase(field);

        if (field === 'id') return null;

        if (typeof value === 'boolean') {
            return (
                <div key={field} className="flex items-center space-x-2 pt-2">
                    <Checkbox id={fieldId} name={field} defaultChecked={value} />
                    <Label htmlFor={fieldId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {title}
                    </Label>
                </div>
            )
        }
        
        // Simple heuristic for textarea
        if (typeof value === 'string' && (value.length > 100 || value.includes('\n'))) {
             return (
                <div key={field} className="grid gap-2">
                    <Label htmlFor={fieldId}>{title}</Label>
                    <Textarea id={fieldId} name={field} placeholder={`Introduce ${title}`} defaultValue={value} />
                </div>
            )
        }

        const isDate = value && typeof value.toDate === 'function';
        const dateValue = isDate ? value.toDate().toISOString().substring(0, 16) : (value instanceof Date ? value.toISOString().substring(0, 16) : null);
        const inputType = typeof value === 'number' ? 'number' : ((isDate || value instanceof Date) ? 'datetime-local' : 'text');
        const defaultValue = isDate ? dateValue : (value instanceof Date ? dateValue : value);

        return (
            <div key={field} className="grid gap-2">
                <Label htmlFor={fieldId}>{title}</Label>
                <Input id={fieldId} name={field} placeholder={`Introduce ${title}`} defaultValue={defaultValue} type={inputType} />
            </div>
        )
    }

    return (
        <form action={dispatch} className="grid gap-6">
            <input type="hidden" name="collectionId" value={collectionId} />
            <input type="hidden"name="documentId" value={document.id} />
            {Object.keys(document).map(field => renderField(field, document[field]))}
            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
