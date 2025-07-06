"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export function SecuritySettingsForm() {
    const { toast } = useToast()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        toast({
            title: "Configuración Guardada",
            description: "Tus cambios en la configuración de seguridad han sido guardados.",
        })
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="allow-registrations" className="text-base">Permitir Registros de Nuevos Usuarios</Label>
                    <p className="text-sm text-muted-foreground">
                        Permite que nuevos usuarios se registren en tu aplicación.
                    </p>
                </div>
                <Switch id="allow-registrations" defaultChecked />
            </div>
            <div className="grid w-full max-w-xl items-center gap-1.5">
                <Label htmlFor="default-role">Rol por Defecto para Nuevos Usuarios</Label>
                <Select defaultValue="Viewer">
                    <SelectTrigger id="default-role">
                        <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Viewer">Lector</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                    </SelectContent>
                </Select>
                 <p className="text-sm text-muted-foreground">
                    El rol asignado a los nuevos usuarios al registrarse.
                </p>
            </div>
            <Button type="submit">Guardar Cambios</Button>
        </form>
    )
}
