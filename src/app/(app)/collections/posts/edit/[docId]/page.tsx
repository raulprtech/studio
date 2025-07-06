import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { getDocumentAction } from "@/lib/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PostEditor } from "../components/post-editor"
  
export default async function EditPostPage({ params }: { params: { docId: string } }) {
    const { docId } = params;
    const collectionId = 'posts';
    const { data: document, error } = await getDocumentAction(collectionId, docId);
    
    if (error || !document) {
        return (
            <div className="flex flex-col gap-6">
                 <h1 className="text-2xl font-semibold capitalize">Editar Post</h1>
                 <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || "No se pudo encontrar el documento solicitado."}</AlertDescription>
                 </Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
             <h1 className="text-2xl font-semibold capitalize">Editar Post</h1>
             <PostEditor collectionId={collectionId} document={document} />
        </div>
    )
}
