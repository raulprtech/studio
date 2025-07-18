

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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AiSummaryButton } from "./components/ai-summary-button"
import { getCollectionDocuments } from "@/lib/data"
import { getRequiredCurrentUser } from "@/lib/auth"
import { DeleteDocumentMenuItem, DuplicateDocumentMenuItem, EditDocumentMenuItem } from "./components/collection-action-items"
import { AiBrainstormButton } from "./components/ai-brainstorm-button"

function toSingularTitleCase(str: string) {
    const singular = str.endsWith('s') ? str.slice(0, -1) : str;
    return singular.charAt(0).toUpperCase() + singular.slice(1);
}

export default async function SingleCollectionPage({ params }: { params: { id: string } }) {
  const collectionId = params.id;
  const data = await getCollectionDocuments(collectionId);
  const fields = data.length > 0 ? Object.keys(data[0]) : [];
  const buttonText = `Añadir ${toSingularTitleCase(collectionId)}`;
  
  const currentUser = await getRequiredCurrentUser();
  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';

  const brainstormDisabledCollections = ['users'];
  const isBrainstormEnabled = canEdit && !brainstormDisabledCollections.includes(collectionId);
  
  const newDocumentHref = collectionId === 'posts'
    ? `/collections/posts/new`
    : collectionId === 'projects'
    ? `/collections/projects/new`
    : `/collections/${collectionId}/new`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold capitalize">{collectionId}</h1>
          <p className="text-sm text-muted-foreground">Gestiona los documentos en la colección '{collectionId}'.</p>
        </div>
        <div className="flex items-center gap-2">
            {isBrainstormEnabled && <AiBrainstormButton collectionName={collectionId} />}
            <AiSummaryButton collectionName={collectionId} />
            {canEdit && (
              <Button asChild>
                <Link href={newDocumentHref}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {buttonText}
                </Link>
              </Button>
            )}
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
                    <TableHead key={field} className="capitalize hidden md:table-cell whitespace-nowrap">{field}</TableHead>
                ))}
                <TableHead>
                  <span className="sr-only">Acciones</span>
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
                        <TableCell key={`${item.id}-${field}`} className="hidden md:table-cell whitespace-nowrap">
                            {typeof item[field] === 'boolean' ? (
                                <Badge variant={item[field] ? "default" : "secondary"}>{String(item[field])}</Badge>
                            ) : (
                                item[field] instanceof Date ? item[field].toLocaleString() : 
                                item[field] && typeof item[field].toDate === 'function' ? item[field].toDate().toLocaleString() :
                                String(item[field] || 'N/D')
                            )}
                        </TableCell>
                    ))}
                  <TableCell>
                    {canEdit && (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menú de acciones</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <EditDocumentMenuItem collectionId={collectionId} documentId={item.id} />
                            <DuplicateDocumentMenuItem collectionId={collectionId} documentId={item.id} />
                            <DeleteDocumentMenuItem 
                                collectionId={collectionId} 
                                documentId={item.id} 
                                documentName={item.name || item.title || item.id} 
                            />
                        </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.length === 0 && (
             <div className="text-center py-10 text-muted-foreground">
                <p>No se encontraron documentos en esta colección.</p>
                {canEdit && (
                    <Button asChild className="mt-4">
                        <Link href={newDocumentHref}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {buttonText}
                        </Link>
                    </Button>
                )}
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
