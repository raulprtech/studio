"use client";

import { useTransition } from "react";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { duplicateDocumentAction, deleteDocumentAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type DocumentActionProps = {
    collectionId: string;
    documentId: string;
}

export function EditDocumentMenuItem({ collectionId, documentId }: DocumentActionProps) {
    // Custom editor for 'posts' collection
    const editHref = collectionId === 'posts'
        ? `/collections/posts/edit/${documentId}`
        : `/collections/${collectionId}/${documentId}/edit`;

    return (
        <DropdownMenuItem asChild>
            <Link href={editHref}>Editar</Link>
        </DropdownMenuItem>
    )
}

export function DuplicateDocumentMenuItem({ collectionId, documentId }: DocumentActionProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleDuplicate = () => {
        startTransition(async () => {
            const result = await duplicateDocumentaction(collectionId, documentId);
            toast({
                title: result.success ? "Éxito" : "Error",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });
        });
    };

    return (
        <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Duplicar
        </DropdownMenuItem>
    );
}


export function DeleteDocumentMenuItem({ collectionId, documentId, documentName }: DocumentActionProps & { documentName: string }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteDocumentAction(collectionId, documentId);
            toast({
                title: result.success ? "Éxito" : "Error",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });
        });
    }

    return (
        <>
            <DropdownMenuSeparator />
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                        Eliminar
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el documento "{documentName}" de la colección '{collectionId}'.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
