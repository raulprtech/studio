import { getDocumentAction } from "@/lib/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ProjectEditor } from "../components/project-editor"
  
export default async function EditProjectPage({ params }: { params: { docId: string } }) {
    const { docId } = params;
    const collectionId = 'projects';
    const { data: document, error } = await getDocumentAction(collectionId, docId);
    
    if (error || !document) {
        return (
            <div className="flex flex-col gap-6">
                 <h1 className="text-2xl font-semibold capitalize">Editar Proyecto</h1>
                 <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || "No se pudo encontrar el documento solicitado."}</AlertDescription>
                 </Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
             <h1 className="text-2xl font-semibold capitalize">Editar Proyecto</h1>
             <ProjectEditor collectionId={collectionId} document={document} />
        </div>
    )
}
