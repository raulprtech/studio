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
    return (
        <DropdownMenuItem asChild>
            <Link href={`/collections/${collectionId}/${documentId}/edit`}>Edit</Link>
        </DropdownMenuItem>
    )
}

export function DuplicateDocumentMenuItem({ collectionId, documentId }: DocumentActionProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleDuplicate = () => {
        startTransition(async () => {
            const result = await duplicateDocumentAction(collectionId, documentId);
            toast({
                title: result.success ? "Success" : "Error",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });
        });
    };

    return (
        <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Duplicate
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
                title: result.success ? "Success" : "Error",
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
                        Delete
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the document "{documentName}" from the '{collectionId}' collection.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
