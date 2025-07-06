"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getCollectionData } from "@/lib/mock-data-client";

function toTitleCase(str: string) {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str) { return str.toUpperCase(); })
}

export function DocumentForm({ collectionId }: { collectionId: string }) {
    const data = getCollectionData(collectionId);
    const fields = data.length > 0 ? Object.keys(data[0]) : [];

    const renderField = (field: string, value: any) => {
        const fieldId = `${collectionId}-${field}`;
        const title = toTitleCase(field);

        if (field === 'id') return null;

        if (typeof value === 'boolean') {
            return (
                <div key={field} className="flex items-center space-x-2 pt-2">
                    <Checkbox id={fieldId} name={field} />
                    <Label htmlFor={fieldId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {title}
                    </Label>
                </div>
            )
        }
        
        if (typeof value === 'string' && value.length > 100) {
             return (
                <div key={field} className="grid gap-2">
                    <Label htmlFor={fieldId}>{title}</Label>
                    <Textarea id={fieldId} name={field} placeholder={`Introduce ${title}`} />
                </div>
            )
        }

        return (
            <div key={field} className="grid gap-2">
                <Label htmlFor={fieldId}>{title}</Label>
                <Input id={fieldId} name={field} placeholder={`Introduce ${title}`} defaultValue={value} type={typeof value === 'number' ? 'number' : 'text'} />
            </div>
        )
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Here you would handle form submission, e.g., send data to a server
        alert("¡Formulario enviado! (Funcionalidad en desarrollo)");
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-6">
            {data.length > 0 && fields.map(field => renderField(field, data[0][field]))}
            <div className="flex justify-end">
                <Button type="submit">Guardar Documento</Button>
            </div>
        </form>
    )
}
