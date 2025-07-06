
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadFileAction } from "@/lib/actions";

export function UploadFileButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, startUploading] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    startUploading(async () => {
      const result = await uploadFileAction(formData, 'general');
      if (result.success) {
        toast({ title: "Archivo Subido", description: "El archivo se ha subido con éxito." });
        setIsOpen(false);
        router.refresh(); // Re-fetches data on the server
      } else {
        toast({ title: "Error de Subida", description: result.error || "No se pudo subir el archivo.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Subir Archivo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir un nuevo archivo</DialogTitle>
          <DialogDescription>
            Selecciona un archivo de tu dispositivo para subirlo al almacenamiento.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="file-upload">Archivo</Label>
                <Input id="file-upload" type="file" onChange={handleFileUpload} disabled={isUploading} />
            </div>
            {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Subiendo archivo... por favor espera.</span>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
