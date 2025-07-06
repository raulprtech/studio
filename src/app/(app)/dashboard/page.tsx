
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Users, UserPlus, Activity } from "lucide-react"
  import { UserChart } from "./components/user-chart";
  import { getAnalyticsData } from "@/lib/analytics";
  
  export default async function DashboardPage() {
    const { summary, userChartData, topPages } = await getAnalyticsData();
    
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <h1 className="flex-1 text-2xl font-semibold">Panel de Control</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Últimos 28 días</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Usuarios</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.newUsers}</div>
              <p className="text-xs text-muted-foreground">Últimos 28 días</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sesiones</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.sessions}</div>
              <p className="text-xs text-muted-foreground">Últimos 28 días</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Últimos 28 días</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Visión General de Usuarios</CardTitle>
              <CardDescription>Total de usuarios en los últimos 6 meses.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
               <UserChart data={userChartData} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Páginas Más Vistas</CardTitle>
              <CardDescription>Tus páginas más vistas en los últimos 28 días.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Página</TableHead>
                    <TableHead className="text-right">Vistas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPages.map((page) => (
                    <TableRow key={page.page}>
                      <TableCell>
                        <div className="font-medium truncate">{page.page}</div>
                      </TableCell>
                      <TableCell className="text-right">{page.views}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
