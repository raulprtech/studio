import Link from "next/link"
import { PlusCircle, MoreHorizontal } from "lucide-react"

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
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const users = [
  { 
    uid: "abc-123", 
    email: "admin@example.com", 
    name: "Admin User", 
    role: "Admin",
    lastSignIn: "2024-05-21T10:00:00Z",
    createdAt: "2023-01-15T09:00:00Z",
    avatar: "https://placehold.co/40x40.png"
  },
  { 
    uid: "def-456", 
    email: "editor@example.com", 
    name: "Editor User", 
    role: "Editor",
    lastSignIn: "2024-05-20T15:30:00Z",
    createdAt: "2023-02-20T11:00:00Z",
    avatar: "https://placehold.co/40x40.png"
  },
  { 
    uid: "ghi-789", 
    email: "viewer@example.com", 
    name: "Viewer User", 
    role: "Viewer",
    lastSignIn: "2024-05-21T18:45:00Z",
    createdAt: "2023-03-10T14:20:00Z",
    avatar: "https://placehold.co/40x40.png"
  },
]

export default function AuthenticationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="flex-1 text-2xl font-semibold">Users</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
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
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{new Date(user.lastSignIn).toLocaleString()}</TableCell>
                  <TableCell className="hidden md:table-cell">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit Role</DropdownMenuItem>
                        <DropdownMenuItem>Send Password Reset</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Disable User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
