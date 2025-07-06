import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { EditSchemaForm } from "./components/edit-schema-form"
import { getCollectionSchema } from "@/lib/mock-data"

export default async function EditCollectionSchemaPage({ params }: { params: { id: string } }) {
    const collectionId = params.id;
    // This function now fetches data from Firestore, so we await its result.
    const { definition: initialSchema, icon: initialIcon } = await getCollectionSchema(collectionId);
    
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold capitalize">Edit Schema for <span className="font-mono bg-muted px-2 py-1 rounded-md">{collectionId}</span></h1>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Schema</CardTitle>
                    <CardDescription>
                        Modify the Zod schema for the '{collectionId}' collection below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* The fetched schema is passed as a prop to the form component */}
                    <EditSchemaForm collectionId={collectionId} initialSchema={initialSchema} initialIcon={initialIcon} />
                </CardContent>
            </Card>
        </div>
    )
}
