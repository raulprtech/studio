"use client";

import dynamic from "next/dynamic";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const UploadFileButton = dynamic(() => import('./upload-file-button').then(mod => mod.UploadFileButton), {
  ssr: false,
  loading: () => (
    <Button disabled>
      <Upload className="mr-2 h-4 w-4" />
      Subir Archivo
    </Button>
  )
});

// Este componente envuelve la importación dinámica para que pueda ser utilizada en un Componente de Servidor.
export function StorageActions() {
  return <UploadFileButton />;
}
