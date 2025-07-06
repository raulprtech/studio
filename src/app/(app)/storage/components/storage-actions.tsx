"use client";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadFileButton } from "./upload-file-button";

// Este componente asegura que el UploadFileButton solo se renderice en el cliente
// para evitar errores de hidratación con Next.js App Router.
export function StorageActions() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Este efecto solo se ejecuta en el cliente, después del montaje inicial.
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Renderiza un marcador de posición en el servidor y durante la carga inicial del cliente.
    return (
      <Button disabled>
        <Upload className="mr-2 h-4 w-4" />
        Subir Archivo
      </Button>
    );
  }

  // Una vez que el cliente se ha montado, renderiza el componente completo.
  return <UploadFileButton />;
}
