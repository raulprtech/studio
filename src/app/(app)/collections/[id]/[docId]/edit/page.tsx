import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { getDocumentAction } from "@/lib/actions"
import { EditDocumentForm } from "./components/edit-document-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
  
export default async function EditDocumentPage({ params }: { params: { id: string; docId: string } }) {
    const { id: collectionId, docId } = params;
    const { data: document, error } = await getDocumentAction(collectionId, docId);
    
    if (error || !document) {
        return (
            <div className="flex flex-col gap-6">
                 <h1 className="text-2xl font-semibold capitalize">Editar Documento</h1>
                 <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || "No se pudo encontrar el documento solicitado."}</AlertDescription>
                 </Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold capitalize">Editar Documento <span className="font-mono bg-muted px-2 py-1 rounded-md">{docId}</span> en <span className="font-mono bg-muted px-2 py-1 rounded-md">{collectionId}</span></h1>
            <Card>
                <CardHeader>
                    <CardTitle>Editar Contenido</CardTitle>
                    <CardDescription>
                        Modifica los campos a continuación para actualizar el documento.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EditDocumentForm collectionId={collectionId} document={document} />
                </CardContent>
            </Card>
        </div>
    )
}
