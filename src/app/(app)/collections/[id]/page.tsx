import Link from "next/link"
import { PlusCircle, File, MoreHorizontal } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { AiSummaryButton } from "./components/ai-summary-button"

const mockData: { [key: string]: any[] } = {
  users: [
    { id: "user-1", email: "alice@example.com", name: "Alice Johnson", role: "Admin", createdAt: "2024-01-15" },
    { id: "user-2", email: "bob@example.com", name: "Bob Williams", role: "Editor", createdAt: "2024-02-20" },
    { id: "user-3", email: "charlie@example.com", name: "Charlie Brown", role: "Viewer", createdAt: "2024-03-10" },
  ],
  posts: [
    { id: "post-1", title: "Getting Started with Next.js", status: "Published", authorId: "user-1", publishedAt: "2024-05-10" },
    { id: "post-2", title: "Advanced Tailwind CSS", status: "Draft", authorId: "user-2", publishedAt: null },
    { id: "post-3", title: "Firebase Authentication Deep Dive", status: "Published", authorId: "user-1", publishedAt: "2024-04-22" },
  ],
  products: [
    { id: "prod-1", name: "Wireless Mouse", price: 25.99, stock: 150, category: "Electronics" },
    { id: "prod-2", name: "Mechanical Keyboard", price: 89.99, stock: 75, category: "Electronics" },
    { id: "prod-3", name: "Coffee Mug", price: 12.50, stock: 300, category: "Kitchenware" },
  ],
  orders: [
    { id: "order-1", customerId: "user-2", amount: 115.98, status: "Shipped", date: "2024-05-18" },
    { id: "order-2", customerId: "user-3", amount: 12.50, status: "Processing", date: "2024-05-20" },
    { id: "order-3", customerId: "user-2", amount: 25.99, status: "Delivered", date: "2024-05-15" },
  ],
}

function getCollectionData(collectionId: string) {
    return mockData[collectionId] || [];
}

export default function SingleCollectionPage({ params }: { params: { id: string } }) {
  const collectionId = params.id;
  const data = getCollectionData(collectionId);
  const fields = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold capitalize">{collectionId}</h1>
          <p className="text-sm text-muted-foreground">Manage the documents in the '{collectionId}' collection.</p>
        </div>
        <div className="flex items-center gap-2">
            <AiSummaryButton collectionName={collectionId} />
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Document
            </Button>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[48px]">
                    <Checkbox />
                </TableHead>
                {fields.map((field) => (
                    <TableHead key={field} className="capitalize hidden md:table-cell">{field}</TableHead>
                ))}
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                    <TableCell>
                        <Checkbox />
                    </TableCell>
                    {fields.map((field) => (
                        <TableCell key={`${item.id}-${field}`} className="hidden md:table-cell">
                            {typeof item[field] === 'boolean' ? (
                                <Badge variant={item[field] ? "default" : "secondary"}>{String(item[field])}</Badge>
                            ) : (
                                item[field] || 'N/A'
                            )}
                        </TableCell>
                    ))}
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
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
