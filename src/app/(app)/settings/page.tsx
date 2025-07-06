import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Configuración</h1>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Gestiona la configuración de tu proyecto aquí.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>El formulario de configuración general irá aquí.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>
                Gestiona la configuración de seguridad de tu proyecto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>El formulario de configuración de seguridad irá aquí.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations">
        <Card>
            <CardHeader>
              <CardTitle>Integraciones</CardTitle>
              <CardDescription>
                Conecta con servicios de terceros.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>La configuración de integraciones irá aquí.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
        <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>
                Personaliza la apariencia de tu panel de administración.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>La configuración de apariencia irá aquí (ej., selector de modo claro/oscuro).</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
