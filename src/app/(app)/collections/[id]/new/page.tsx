import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { DocumentForm } from "./components/document-form"
  
export default function NewDocumentPage({ params }: { params: { id: string } }) {
    const collectionId = params.id;
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold capitalize">New Document in <span className="font-mono bg-muted px-2 py-1 rounded-md">{collectionId}</span></h1>
            <Card>
                <CardHeader>
                    <CardTitle>Create Document</CardTitle>
                    <CardDescription>
                        Fill out the form below to add a new document to the '{collectionId}' collection.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DocumentForm collectionId={collectionId} />
                </CardContent>
            </Card>
        </div>
    )
}
