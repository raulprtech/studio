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
import { getCollections } from "@/lib/data"
import { PinCollectionMenuItem } from "./components/pin-collection-menu-item"
import { PinStatusIcon } from "./components/pin-status-icon"
import { DynamicIcon } from "@/components/dynamic-icon"

export default async function CollectionsPage() {
  const collections = await getCollections();

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
                    <div className="flex items-center gap-3">
                      <DynamicIcon name={collection.icon} className="h-5 w-5 text-muted-foreground" />
                      <Link href={`/collections/${collection.name}`} className="hover:underline font-semibold">
                        {collection.name}
                      </Link>
                      <PinStatusIcon collectionName={collection.name} />
                    </div>
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
                        <PinCollectionMenuItem collectionName={collection.name} />
                        <DropdownMenuItem asChild>
                          <Link href={`/collections/${collection.name}/edit`}>Edit Schema</Link>
                        </DropdownMenuItem>
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
