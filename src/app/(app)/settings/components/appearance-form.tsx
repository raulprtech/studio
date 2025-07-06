"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function AppearanceForm() {
    const { toast } = useToast()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        toast({
            title: "Configuración Guardada",
            description: "Tus cambios de apariencia han sido guardados.",
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
                <Label>Tema de la Interfaz</Label>
                <p className="text-sm text-muted-foreground">
                    Selecciona el tema para el panel de administración.
                </p>
                 <div className="pt-2">
                    <ModeToggle />
                </div>
            </div>
             <div className="space-y-2">
                 <Label>Fuente</Label>
                <p className="text-sm text-muted-foreground">
                    Próximamente: Personaliza la fuente del panel.
                </p>
            </div>
            <Button type="submit">Guardar Cambios</Button>
        </form>
    )
}
