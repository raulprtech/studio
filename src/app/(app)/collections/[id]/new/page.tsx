import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { NewDocumentForm } from "./components/document-form"
import { getSchemaFieldsAction } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
  
export default async function NewDocumentPage({ params }: { params: { id: string } }) {
    const collectionId = params.id;
    const { fields, error } = await getSchemaFieldsAction(collectionId);
    
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold capitalize">Nuevo Documento en <span className="font-mono bg-muted px-2 py-1 rounded-md">{collectionId}</span></h1>
            <Card>
                <CardHeader>
                    <CardTitle>Crear Documento</CardTitle>
                    <CardDescription>
                        Rellena el formulario a continuación para añadir un nuevo documento a la colección '{collectionId}'.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error al Cargar el Esquema</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {fields && fields.length > 0 && <NewDocumentForm collectionId={collectionId} fields={fields} />}
                    {fields && fields.length === 0 && !error && (
                         <Alert>
                            <AlertTitle>Esquema Vacío</AlertTitle>
                            <AlertDescription>No se han definido campos en el esquema de esta colección. Edita el esquema para añadir campos antes de crear un documento.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
