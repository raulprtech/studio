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

const collections = [
  { name: "users", count: 1234, schemaFields: 5, lastUpdated: "2024-05-20T10:00:00Z" },
  { name: "posts", count: 567, schemaFields: 8, lastUpdated: "2024-05-21T14:30:00Z" },
  { name: "products", count: 89, schemaFields: 12, lastUpdated: "2024-05-19T08:45:00Z" },
  { name: "orders", count: 2456, schemaFields: 15, lastUpdated: "2024-05-21T18:00:00Z" },
]

export default function CollectionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="flex-1 text-2xl font-semibold">Collections</h1>
        <Button asChild>
          <Link href="/collections/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Collection
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Firestore Collections</CardTitle>
          <CardDescription>Manage and view your data collections.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Documents</TableHead>
                <TableHead className="hidden md:table-cell">Schema Fields</TableHead>
                <TableHead className="hidden sm:table-cell">Last Updated</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.name}>
                  <TableCell className="font-medium">
                    <Link href={`/collections/${collection.name}`} className="hover:underline">
                      {collection.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{collection.count.toLocaleString()}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{collection.schemaFields}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{new Date(collection.lastUpdated).toLocaleDateString()}</TableCell>
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
                        <DropdownMenuItem asChild>
                           <Link href={`/collections/${collection.name}`}>View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Schema</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
