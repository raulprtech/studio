import { SchemaForm } from "./components/schema-form";
  
export default function NewCollectionPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold">New Collection</h1>
                <p className="text-muted-foreground">
                    Define a new Firestore collection by providing a name, an icon, and a Zod schema. You can use AI to help generate it.
                </p>
            </div>
            <SchemaForm />
        </div>
    )
}
