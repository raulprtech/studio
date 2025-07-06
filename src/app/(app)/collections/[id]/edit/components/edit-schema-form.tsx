"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCollectionSchema } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export function EditSchemaForm({ collectionId }: { collectionId: string }) {
    const { toast } = useToast();
    const [schema, setSchema] = useState(() => getCollectionSchema(collectionId));

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Here you would handle form submission, e.g., send data to a server
        console.log("Updated schema:", schema);
        toast({
            title: "Schema Updated",
            description: "Your schema changes have been saved (simulated).",
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-6">
             <div className="grid gap-2">
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input id="collection-name" name="collectionName" value={collectionId} disabled />
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
                />
            </div>
            <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    )
}
