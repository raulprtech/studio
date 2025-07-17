
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EditSchemaForm } from "./components/edit-schema-form"
import { getCollectionSchema } from "@/lib/data"

function ProjectSchemaInfo() {
    return (
        <Alert className="mb-6">
            <AlertTitle>Estructura de la Colección de Proyectos</AlertTitle>
            <AlertDescription>
                <p className="mb-4">Para que la página de portafolio público funcione correctamente, la colección <strong>projects</strong> debe tener los siguientes campos. Puedes extender este esquema, pero no elimines estos campos base.</p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li><strong>title</strong> (Texto): El nombre principal de tu proyecto.</li>
                    <li><strong>description</strong> (Texto): Una descripción corta para las tarjetas del proyecto.</li>
                    <li><strong>longDescription</strong> (Texto): Una descripción detallada para la página del proyecto (admite Markdown).</li>
                    <li><strong>coverImageUrl</strong> (URL de texto): Enlace a la imagen de portada.</li>
                    <li><strong>tags</strong> (Lista de textos): Tecnologías o etiquetas (ej. "React, Firebase").</li>
                    <li><strong>liveUrl</strong> (URL de texto): Enlace al proyecto en producción.</li>
                    <li><strong>githubUrl</strong> (URL de texto): Enlace al repositorio de código.</li>
                    <li><strong>gallery</strong> (Lista de URLs): Enlaces a imágenes para la galería del proyecto.</li>
                    <li><strong>hint</strong> (Texto): Una pista de 1-2 palabras para la IA de las imágenes de marcador de posición (ej. "website screenshot").</li>
                </ul>
            </AlertDescription>
        </Alert>
    )
}

export default async function EditCollectionSchemaPage({ params }: { params: { id: string } }) {
    const collectionId = params.id;
    // This function now fetches data from Firestore, so we await its result.
    const { definition: initialSchema, icon: initialIcon } = await getCollectionSchema(collectionId);
    
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold capitalize">Editar Esquema para <span className="font-mono bg-muted px-2 py-1 rounded-md">{collectionId}</span></h1>
            
            {collectionId === 'projects' && <ProjectSchemaInfo />}

            <Card>
                <CardHeader>
                    <CardTitle>Editar Esquema</CardTitle>
                    <CardDescription>
                        Modifica el esquema de Zod para la colección '{collectionId}' a continuación.
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
