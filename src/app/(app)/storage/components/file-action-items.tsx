"use client";

import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteFileAction } from "@/lib/actions";
import { MoreVertical, Loader2, Copy, Download, Trash2, Eye } from "lucide-react";

type FileActionProps = {
  file: {
    name: string;
    url: string;
  };
};

export function FileActionItems({ file }: FileActionProps) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(file.url);
    toast({ title: "URL Copiada", description: "La URL del archivo se ha copiado al portapapeles." });
  };
  
  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteFileAction(file.name);
      toast({
        title: result.success ? "Éxito" : "Error",
        description: result.message || result.error,
        variant: result.success ? "default" : "destructive",
      });
    });
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Abrir menú de archivo</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => window.open(file.url, '_blank')}>
            <Eye className="mr-2 h-4 w-4" />
            Ver/Abrir
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar URL
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={file.url} download={file.name.split('/').pop()}>
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
               <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el archivo
            <span className="font-mono bg-muted px-1 py-0.5 rounded-sm mx-1">{file.name}</span>
            de Firebase Storage.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
