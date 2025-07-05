import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { SchemaForm } from "./components/schema-form";
  
export default function NewCollectionPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold">New Collection</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Define Schema with AI</CardTitle>
                    <CardDescription>
                        Describe the data you want to store in your new collection, and we'll suggest a schema for you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SchemaForm />
                </CardContent>
            </Card>
        </div>
    )
}
