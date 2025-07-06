"use client";

import { useEffect, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCollectionSchema } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { updateSchemaAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
        </Button>
    );
}

export function EditSchemaForm({ collectionId }: { collectionId: string }) {
    const { toast } = useToast();
    const [schema, setSchema] = useState(() => getCollectionSchema(collectionId));

    const initialState = { message: null, errors: null, success: false };
    const [state, dispatch] = useActionState(updateSchemaAction, initialState);

    useEffect(() => {
        if (state.success && state.message) {
            toast({
                title: "Schema Updated",
                description: state.message,
            });
        } else if (!state.success && state.message && state.errors) {
             toast({
                title: "Error updating schema",
                description: Object.values(state.errors).flat().join('\n'),
                variant: "destructive",
            });
        }
    }, [state, toast]);

    return (
        <form action={dispatch} className="grid gap-6">
             <div className="grid gap-2">
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input id="collection-name" name="collectionId" value={collectionId} readOnly />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="schema-definition">Schema Definition (Zod)</Label>
                <Textarea
                    id="schema-definition"
                    name="schemaDefinition"
                    value={schema}
                    onChange={(e) => setSchema(e.target.value)}
                    rows={15}
                    className="font-mono"
                    placeholder="Enter your Zod schema here."
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
