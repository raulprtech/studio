
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
  import { Users, UserPlus, Activity, TestTube2 } from "lucide-react"
  import { UserChart } from "./components/user-chart";
  import { getAnalyticsData } from "@/lib/analytics";
  import { cookies } from "next/headers";
  import { ModeSwitch } from "./components/mode-switch";
  import { isFirebaseConfigured } from "@/lib/firebase-admin";
  
  export default async function DashboardPage() {
    const { summary, userChartData, topPages } = await getAnalyticsData();
    const mode = cookies().get('app-mode')?.value === 'live' ? 'live' : 'demo';
    const liveModeAvailable = isFirebaseConfigured;
    
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <h1 className="flex-1 text-2xl font-semibold">Dashboard</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Application Mode</CardTitle>
                    <TestTube2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <ModeSwitch initialMode={mode} isConfigured={liveModeAvailable} />
                    <p className="text-xs text-muted-foreground pt-2">
                        {liveModeAvailable ? "Toggle between live and demo data." : "Firebase not configured. Only demo mode is available."}
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Last 28 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.newUsers}</div>
              <p className="text-xs text-muted-foreground">Last 28 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.sessions}</div>
              <p className="text-xs text-muted-foreground">Last 28 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Last 28 days</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Users Overview</CardTitle>
              <CardDescription>Total users over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
               <UserChart data={userChartData} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Top Pages by Views</CardTitle>
              <CardDescription>Your most viewed pages in the last 28 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
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
  
