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

function CreateCollectionSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Collection
        </Button>
    );
}

export function SchemaForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [dataDescription, setDataDescription] = useState("");
    const [schema, setSchema] = useState("");
    const [isGenerating, startTransition] = useTransition();

    const initialState = { message: null, errors: {}, success: false, redirectUrl: null };
    const [state, formAction] = useActionState(createCollectionAction, initialState);
    
    useEffect(() => {
        if (state.success && state.redirectUrl) {
            toast({
                title: "Success!",
                description: state.message || "Collection created.",
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
                title: "Description too short",
                description: "Please provide a more detailed description (at least 10 characters).",
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
                    title: "Schema Generated",
                    description: "The AI-generated schema has been populated below. You can edit it before saving.",
                });
            } else if (result.message) {
                 toast({
                    title: "Error Generating Schema",
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
                     <CardTitle>Collection Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="collection-name">Collection Name</Label>
                            <Input id="collection-name" name="collectionName" placeholder="e.g., posts, users" required />
                            {state.errors?.collectionName && <p className="text-sm font-medium text-destructive">{state.errors.collectionName[0]}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="collection-icon">Icon Name (from Lucide)</Label>
                            <Input id="collection-icon" name="icon" placeholder="e.g., Package, Users, FileText" />
                            <p className="text-xs text-muted-foreground">
                                Find icons at <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">lucide.dev/icons</a>. Use PascalCase names.
                            </p>
                            {state.errors?.icon && <p className="text-sm font-medium text-destructive">{state.errors.icon[0]}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Define Schema</CardTitle>
                    <CardDescription>
                        Describe your data to generate a schema with AI, or write one manually below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="dataDescription">Data Description for AI</Label>
                        <Textarea
                            id="dataDescription"
                            name="dataDescription"
                            value={dataDescription}
                            onChange={(e) => setDataDescription(e.target.value)}
                            placeholder="e.g., A blog post with a title, content (rich text), author name, and publication date."
                            rows={3}
                        />
                    </div>
                     <Button type="button" variant="outline" onClick={handleGenerateSchema} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate with AI
                    </Button>
                    <div className="grid gap-2">
                        <Label htmlFor="schemaDefinition">Zod Schema Definition</Label>
                        <Textarea
                            id="schemaDefinition"
                            name="schemaDefinition"
                            value={schema}
                            onChange={(e) => setSchema(e.target.value)}
                            placeholder="import { z } from 'zod';\n\nexport const schema = z.object({\n  // Your schema fields here\n});"
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
