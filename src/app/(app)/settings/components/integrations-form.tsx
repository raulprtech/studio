"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Copy } from "lucide-react"

export function IntegrationsForm() {
    const { toast } = useToast()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        toast({
            title: "Configuración Guardada",
            description: "Tus cambios en la configuración de integraciones han sido guardados.",
        })
    }

    const copyToClipboard = (text: string) => {
        if(!text) {
            toast({ title: "Vacío", description: "No hay nada que copiar."})
            return;
        }
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado", description: "La clave API ha sido copiada."})
    }

    return (
         <form onSubmit={handleSubmit} className="space-y-8">
             <div className="space-y-2">
                <Label htmlFor="ga-id">ID de Propiedad de Google Analytics</Label>
                <div className="flex items-center gap-2 max-w-xl">
                    <Input id="ga-id" defaultValue={process.env.GOOGLE_ANALYTICS_PROPERTY_ID || ""} placeholder="G-XXXXXXXXXX" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '')}><Copy className="h-4 w-4" /></Button>
                </div>
                 <p className="text-sm text-muted-foreground">
                    Conecta tu propiedad de Google Analytics para ver métricas en el panel.
                </p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="mail-api-key">Clave API del Servicio de Correo</Label>
                 <div className="flex items-center gap-2 max-w-xl">
                    <Input id="mail-api-key" type="password" defaultValue="supersecretapikey" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard('supersecretapikey')}><Copy className="h-4 w-4" /></Button>
                </div>
                 <p className="text-sm text-muted-foreground">
                    Clave API para servicios como SendGrid o Mailgun para el envío de correos.
                </p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="public-api-key">Clave API Pública del SDK de Cliente</Label>
                 <div className="flex items-center gap-2 max-w-xl">
                    <Input id="public-api-key" defaultValue={process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSy...tu...clave"} readOnly disabled />
                    <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '')}><Copy className="h-4 w-4" /></Button>
                </div>
                 <p className="text-sm text-muted-foreground">
                    Esta es tu clave API pública de Firebase para usar en el lado del cliente.
                </p>
            </div>
            <Button type="submit">Guardar Cambios</Button>
        </form>
    )
}
