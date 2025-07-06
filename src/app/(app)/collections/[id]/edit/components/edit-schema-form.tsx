"use client";

import { useEffect, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateSchemaAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import { IconPicker } from "@/components/icon-picker";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
        </Button>
    );
}

export function EditSchemaForm({ collectionId, initialSchema, initialIcon }: { collectionId: string, initialSchema: string, initialIcon: string | null }) {
    const { toast } = useToast();
    const [schema, setSchema] = useState(initialSchema);
    const [icon, setIcon] = useState(initialIcon || "");

    const initialState = { message: null, errors: null, success: false };
    const [state, dispatch] = useActionState(updateSchemaAction, initialState);

    useEffect(() => {
        if (state.success) {
            if(state.message) {
                 toast({
                    title: "Esquema Actualizado",
                    description: state.message,
                });
            }
        } else if (state.message) { // Handles failure message from server
             toast({
                title: "Error al Actualizar Esquema",
                description: state.message,
                variant: "destructive",
            });
        } else if (state.errors) { // Handles validation errors
             toast({
                title: "Error de Validación",
                description: Object.values(state.errors).flat().join('\n'),
                variant: "destructive",
            });
        }
    }, [state, toast]);

    return (
        <form action={dispatch} className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="collection-name">Nombre de la Colección</Label>
                    <Input id="collection-name" name="collectionId" value={collectionId} readOnly />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="collection-icon">Icono</Label>
                     <IconPicker
                        value={icon}
                        onChange={setIcon}
                        defaultValue={initialIcon || "Package"}
                    />
                    <input type="hidden" name="icon" value={icon} />
                    <p className="text-xs text-muted-foreground">
                        Cambia el icono visual de tu colección.
                    </p>
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="schema-definition">Definición de Esquema (Zod)</Label>
                <Textarea
                    id="schema-definition"
                    name="schemaDefinition"
                    value={schema}
                    onChange={(e) => setSchema(e.target.value)}
                    rows={15}
                    className="font-mono"
                    placeholder="Introduce tu esquema de Zod aquí."
                    required
                />
                 {state.errors?.schemaDefinition &&
                    state.errors.schemaDefinition.map((error: string) => (
                        <p className="text-sm font-medium text-destructive" key={error}>
                            {error}
                        </p>
                    ))
                }
            </div>
            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    )
}
