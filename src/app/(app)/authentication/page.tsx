import { PlusCircle, MoreHorizontal } from "lucide-react"
import { revalidatePath } from "next/cache"

import { Button } from "@/components/ui/button"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser } from "@/lib/auth"
import { authAdmin, isFirebaseAdminInitialized } from "@/lib/firebase-admin"
import { mockData } from "@/lib/mock-data"
import { EditRoleMenuItem, SendPasswordResetMenuItem, ToggleUserStatusMenuItem } from "./components/user-action-items"

export default async function AuthenticationPage() {
  const currentUser = await getCurrentUser();
  let users: any[] = [];

  if (isFirebaseAdminInitialized && authAdmin) {
    try {
      const userRecords = await authAdmin.listUsers();
      users = userRecords.users.map(user => ({
        uid: user.uid,
        email: user.email || null,
        name: user.displayName || user.email?.split('@')[0] || 'Unnamed User',
        role: user.customClaims?.role || 'Viewer', // Default to viewer
        lastSignIn: user.metadata.lastSignInTime,
        createdAt: user.metadata.creationTime,
        avatar: user.photoURL || `https://placehold.co/40x40.png`,
        disabled: user.disabled,
      }));
    } catch (error) {
        console.error("Error fetching users from Firebase Auth:", error);
        // Fallback to mock data on error
        users = mockData.users.map(u => ({...u, uid: u.id, lastSignIn: new Date().toISOString(), createdAt: new Date().toISOString(), avatar: 'https://placehold.co/40x40.png', disabled: u.disabled || false}));
    }
  } else {
    // Fallback to mock data if Firebase isn't set up
    users = mockData.users.map(u => ({...u, uid: u.id, lastSignIn: new Date().toISOString(), createdAt: new Date().toISOString(), avatar: 'https://placehold.co/40x40.png', disabled: u.disabled || false}));
  }

  const isAdmin = currentUser.role === 'Admin';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="flex-1 text-2xl font-semibold">Users</h1>
        {isAdmin && (
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
            </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user access and roles for your project.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Last Sign-In</TableHead>
                <TableHead className="hidden md:table-cell">Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid} className={user.disabled ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar" />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email || 'No email'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                    {user.disabled && <Badge variant="destructive" className="ml-2">Disabled</Badge>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.lastSignIn ? new Date(user.lastSignIn).toLocaleString() : 'Never'}</TableCell>
                  <TableCell className="hidden md:table-cell">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    {isAdmin && (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <EditRoleMenuItem user={user} />
                            <SendPasswordResetMenuItem user={user} />
                            <DropdownMenuSeparator />
                            <ToggleUserStatusMenuItem user={user} />
                        </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
