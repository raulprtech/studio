"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function GeneralSettingsForm() {
    const { toast } = useToast()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        toast({
            title: "Configuración Guardada",
            description: "Tus cambios en la configuración general han sido guardados.",
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
             <div className="grid w-full max-w-xl items-center gap-1.5">
                <Label htmlFor="project-name">Nombre del Proyecto</Label>
                <Input id="project-name" defaultValue="Admin Spark" />
                 <p className="text-sm text-muted-foreground">
                    El nombre que se mostrará en el panel de administración.
                </p>
            </div>
            <div className="grid w-full max-w-xl items-center gap-1.5">
                <Label htmlFor="project-id">ID del Proyecto</Label>
                <Input id="project-id" defaultValue={process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tu-id-de-proyecto"} readOnly disabled />
                 <p className="text-sm text-muted-foreground">
                    Este es tu ID de proyecto de Firebase. No se puede cambiar.
                </p>
            </div>
             <div className="grid w-full max-w-xl items-center gap-1.5">
                <Label htmlFor="project-region">Región por Defecto</Label>
                <Select defaultValue="us-central1">
                    <SelectTrigger id="project-region">
                        <SelectValue placeholder="Selecciona una región" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="us-central1">us-central1</SelectItem>
                        <SelectItem value="us-east1">us-east1</SelectItem>
                        <SelectItem value="europe-west1">europe-west1</SelectItem>
                        <SelectItem value="asia-southeast1">asia-southeast1</SelectItem>
                    </SelectContent>
                </Select>
                 <p className="text-sm text-muted-foreground">
                    La región por defecto para las funciones de Firebase.
                </p>
            </div>
            <Button type="submit">Guardar Cambios</Button>
        </form>
    )
}
