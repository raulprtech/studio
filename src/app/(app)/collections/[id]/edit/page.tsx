import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { EditSchemaForm } from "./components/edit-schema-form"

export default function EditCollectionSchemaPage({ params }: { params: { id: string } }) {
    const collectionId = params.id;
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
                    <EditSchemaForm collectionId={collectionId} />
                </CardContent>
            </Card>
        </div>
    )
}
