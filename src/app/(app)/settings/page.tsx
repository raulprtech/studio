import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettingsForm } from "./components/general-settings-form"
import { SecuritySettingsForm } from "./components/security-settings-form"
import { IntegrationsForm } from "./components/integrations-form"
import { AppearanceForm } from "./components/appearance-form"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Configuración</h1>
      <Tabs defaultValue="general" className="grid md:grid-cols-5 gap-10">
        <TabsList className="md:col-span-1 flex-col h-auto items-stretch bg-transparent p-0 border-none space-y-1">
          <TabsTrigger value="general" className="justify-start data-[state=active]:bg-muted data-[state=active]:shadow-none !px-3 !py-2">General</TabsTrigger>
          <TabsTrigger value="security" className="justify-start data-[state=active]:bg-muted data-[state=active]:shadow-none !px-3 !py-2">Seguridad</TabsTrigger>
          <TabsTrigger value="integrations" className="justify-start data-[state=active]:bg-muted data-[state=active]:shadow-none !px-3 !py-2">Integraciones</TabsTrigger>
          <TabsTrigger value="appearance" className="justify-start data-[state=active]:bg-muted data-[state=active]:shadow-none !px-3 !py-2">Apariencia</TabsTrigger>
        </TabsList>
        <div className="md:col-span-4">
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración General</CardTitle>
                  <CardDescription>
                    Gestiona la configuración general de tu proyecto aquí.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GeneralSettingsForm />
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
                  <SecuritySettingsForm />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="integrations">
            <Card>
                <CardHeader>
                  <CardTitle>Integraciones</CardTitle>
                  <CardDescription>
                    Conecta con servicios de terceros y gestiona claves API.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <IntegrationsForm />
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
                  <AppearanceForm />
                </CardContent>
              </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
