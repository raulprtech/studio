import { SchemaForm } from "./components/schema-form";
  
export default function NewCollectionPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Nueva Colección</h1>
                <p className="text-muted-foreground">
                    Define una nueva colección de Firestore proporcionando un nombre, un icono y un esquema de Zod. Puedes usar IA para ayudar a generarlo.
                </p>
            </div>
            <SchemaForm />
        </div>
    )
}
