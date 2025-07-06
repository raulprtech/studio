"use client";

import { useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { createDocumentAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";

type Field = {
  name: string;
  type: string;
};

function toTitleCase(str: string) {
    if (!str) return '';
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Documento
        </Button>
    );
}

export function NewDocumentForm({ collectionId, fields }: { collectionId: string, fields: Field[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const initialState = { message: null, success: false, errors: null as any, redirectUrl: null };
    const [state, dispatch] = useActionState(createDocumentAction, initialState);

    useEffect(() => {
        if (state.success && state.redirectUrl) {
            toast({
                title: "¡Éxito!",
                description: state.message,
            });
            router.push(state.redirectUrl);
        } else if (!state.success && state.message) {
            toast({
                title: "Error",
                description: state.message,
                variant: "destructive",
            });
        }
    }, [state, router, toast]);

    const renderField = (field: Field) => {
        const fieldId = `${collectionId}-${field.name}`;
        const title = toTitleCase(field.name);

        if (field.type === 'ZodBoolean') {
            return (
                <div key={field.name} className="flex items-center space-x-2 pt-2">
                    <Checkbox id={fieldId} name={field.name} />
                    <Label htmlFor={fieldId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {title}
                    </Label>
                     {state.errors?.[field.name] && <p className="text-sm font-medium text-destructive">{state.errors[field.name][0]}</p>}
                </div>
            );
        }
        
        // A simple heuristic for textarea vs input
        const isTextarea = field.name.toLowerCase().includes('description') || field.name.toLowerCase().includes('content');

        if (isTextarea) {
             return (
                <div key={field.name} className="grid gap-2">
                    <Label htmlFor={fieldId}>{title}</Label>
                    <Textarea id={fieldId} name={field.name} placeholder={`Introduce ${title}`} />
                    {state.errors?.[field.name] && <p className="text-sm font-medium text-destructive">{state.errors[field.name][0]}</p>}
                </div>
            );
        }

        const inputType = field.type === 'ZodNumber' ? 'number' : (field.type === 'ZodDate' ? 'datetime-local' : 'text');

        return (
            <div key={field.name} className="grid gap-2">
                <Label htmlFor={fieldId}>{title}</Label>
                <Input id={fieldId} name={field.name} placeholder={`Introduce ${title}`} type={inputType} />
                {state.errors?.[field.name] && <p className="text-sm font-medium text-destructive">{state.errors[field.name][0]}</p>}
            </div>
        );
    }

    return (
        <form action={dispatch} className="grid gap-6">
            <input type="hidden" name="collectionId" value={collectionId} />
            {fields.map(field => renderField(field))}
            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
