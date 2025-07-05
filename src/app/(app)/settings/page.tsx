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
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your project settings here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>General settings form will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your project's security settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Security settings form will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations">
        <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect with third-party services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Integrations settings will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
        <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your admin panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Appearance settings will go here (e.g., light/dark mode toggle).</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
