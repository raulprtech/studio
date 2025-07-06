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
import { Checkbox } from "@/components/ui/checkbox"
import { AiSummaryButton } from "./components/ai-summary-button"
import { getCollectionData } from "@/lib/mock-data"

function toSingularTitleCase(str: string) {
    const singular = str.endsWith('s') ? str.slice(0, -1) : str;
    return singular.charAt(0).toUpperCase() + singular.slice(1);
}

export default function SingleCollectionPage({ params }: { params: { id: string } }) {
  const collectionId = params.id;
  const data = getCollectionData(collectionId);
  const fields = data.length > 0 ? Object.keys(data[0]) : [];
  const buttonText = `Add ${toSingularTitleCase(collectionId)}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold capitalize">{collectionId}</h1>
          <p className="text-sm text-muted-foreground">Manage the documents in the '{collectionId}' collection.</p>
        </div>
        <div className="flex items-center gap-2">
            <AiSummaryButton collectionName={collectionId} />
            <Button asChild>
              <Link href={`/collections/${collectionId}/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {buttonText}
              </Link>
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
