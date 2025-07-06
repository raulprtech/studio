"use client";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadFileButton } from "./upload-file-button";

// Este componente sirve como un límite "use client" para que
// el componente de servidor (la página de almacenamiento) pueda renderizar el botón de subida.
export function StorageActions() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // En el servidor y durante la carga inicial del cliente, muestra un marcador de posición
  // para evitar errores de hidratación.
  if (!isClient) {
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
