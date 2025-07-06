
"use client";

import { UploadFileButton } from "./upload-file-button";

// Este componente sirve como un límite "use client" para que
// el componente de servidor (la página de almacenamiento) pueda renderizar el botón de subida.
export function StorageActions() {
  return <UploadFileButton />;
}
