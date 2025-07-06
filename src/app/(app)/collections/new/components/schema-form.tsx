"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createCollectionAction, getSchemaSuggestionAction } from "@/lib/actions";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconPicker } from "@/components/icon-picker";

function CreateCollectionSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Colección
        </Button>
    );
}

export function SchemaForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [dataDescription, setDataDescription] = useState("");
    const [schema, setSchema] = useState("");
    const [icon, setIcon] = useState("Package");
    const [isGenerating, startTransition] = useTransition();

    const initialState = { message: null, errors: {}, success: false, redirectUrl: null };
    const [state, formAction] = useActionState(createCollectionAction, initialState);
    
    useEffect(() => {
        if (state.success && state.redirectUrl) {
            toast({
                title: "¡Éxito!",
                description: state.message || "Colección creada.",
            });
            router.push(state.redirectUrl);
        } else if (state.message && !state.success) {
            toast({
                title: "Error",
                description: state.message,
                variant: "destructive",
            });
        }
    }, [state, router, toast]);

    const handleGenerateSchema = () => {
        if (dataDescription.length < 10) {
            toast({
                title: "Descripción demasiado corta",
                description: "Por favor, proporciona una descripción más detallada (al menos 10 caracteres).",
                variant: "destructive"
            });
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append('dataDescription', dataDescription);
            const result = await getSchemaSuggestionAction(null, formData);
            if (result.schema) {
                setSchema(result.schema);
                toast({
                    title: "Esquema Generado",
                    description: "El esquema generado por IA se ha rellenado a continuación. Puedes editarlo antes de guardarlo.",
                });
            } else if (result.message) {
                 toast({
                    title: "Error al Generar el Esquema",
                    description: result.message,
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <form id="new-collection-form" action={formAction} className="grid gap-6">
            <Card>
                <CardHeader>
                     <CardTitle>Detalles de la Colección</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="collection-name">Nombre de la Colección</Label>
                            <Input id="collection-name" name="collectionName" placeholder="ej., posts, usuarios" required />
                            {state.errors?.collectionName && <p className="text-sm font-medium text-destructive">{state.errors.collectionName[0]}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="collection-icon">Icono</Label>
                            <IconPicker
                                value={icon}
                                onChange={setIcon}
                                defaultValue="Package"
                            />
                            <input type="hidden" name="icon" value={icon} />
                            <p className="text-xs text-muted-foreground">
                                Selecciona un icono visual para tu colección.
                            </p>
                            {state.errors?.icon && <p className="text-sm font-medium text-destructive">{state.errors.icon[0]}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Definir Esquema</CardTitle>
                    <CardDescription>
                        Describe tus datos para generar un esquema con IA, o escribe uno manualmente a continuación.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="dataDescription">Descripción de Datos para la IA</Label>
                        <Textarea
                            id="dataDescription"
                            name="dataDescription"
                            value={dataDescription}
                            onChange={(e) => setDataDescription(e.target.value)}
                            placeholder="ej., Una entrada de blog con un título, contenido (texto enriquecido), nombre del autor y fecha de publicación."
                            rows={3}
                        />
                    </div>
                     <Button type="button" variant="outline" onClick={handleGenerateSchema} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generar con IA
                    </Button>
                    <div className="grid gap-2">
                        <Label htmlFor="schemaDefinition">Definición de Esquema Zod</Label>
                        <Textarea
                            id="schemaDefinition"
                            name="schemaDefinition"
                            value={schema}
                            onChange={(e) => setSchema(e.target.value)}
                            placeholder="import { z } from 'zod';\n\nexport const schema = z.object({\n  // Tus campos de esquema aquí\n});"
                            rows={15}
                            className="font-mono"
                            required
                        />
                        {state.errors?.schemaDefinition && <p className="text-sm font-medium text-destructive">{state.errors.schemaDefinition[0]}</p>}
                    </div>
                </CardContent>
            </Card>

            <CreateCollectionSubmitButton />
            
            {state.message && !state.success && (
                 <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                 </Alert>
            )}
        </form>
    );
}
