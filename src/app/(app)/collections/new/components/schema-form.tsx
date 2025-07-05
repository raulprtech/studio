"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSchemaSuggestionAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Schema
        </Button>
    );
}

export function SchemaForm() {
    const initialState = { message: null, errors: {}, schema: null };
    const [state, dispatch] = useFormState(getSchemaSuggestionAction, initialState);

    return (
        <form action={dispatch} className="grid gap-6">
            <div className="grid gap-2">
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input id="collection-name" name="collectionName" placeholder="e.g., posts, users, products" required />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="dataDescription">Data Description</Label>
                <Textarea
                    id="dataDescription"
                    name="dataDescription"
                    placeholder="Describe your data. For example: 'A blog post with a title, content (rich text), author name, and publication date.'"
                    rows={5}
                />
                {state.errors?.dataDescription &&
                    state.errors.dataDescription.map((error: string) => (
                        <p className="text-sm font-medium text-destructive" key={error}>
                            {error}
                        </p>
                    ))
                }
            </div>

            <SubmitButton />

            {state.schema && (
                <Card>
                    <CardHeader>
                        <CardTitle>Suggested Zod Schema</CardTitle>
                        <CardDescription>
                            Here's a schema based on your description. You can copy it or save the collection.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
                            <code>{state.schema}</code>
                        </pre>
                        <div className="flex justify-end gap-2 mt-4">
                           <Button variant="outline">Copy Schema</Button>
                           <Button>Save Collection</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {state.message && !state.schema && (
                 <p className="text-sm font-medium text-destructive">{state.message}</p>
            )}
        </form>
    );
}
