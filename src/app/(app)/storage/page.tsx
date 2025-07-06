
import Image from "next/image"
import dynamic from "next/dynamic"
import { MoreVertical, FileText, FileImage, FileAudio, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCurrentUser } from "@/lib/auth"
import { getStorageFiles } from "@/lib/data"

const UploadFileButton = dynamic(() => import('./components/upload-file-button').then(mod => mod.UploadFileButton), {
  ssr: false,
  loading: () => (
    <Button disabled>
      <Upload className="mr-2 h-4 w-4" />
      Subir Archivo
    </Button>
  )
})

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType.startsWith("image/")) {
    return <FileImage className="w-8 h-8 text-muted-foreground" />;
  }
  if (fileType.startsWith("audio/")) {
    return <FileAudio className="w-8 h-8 text-muted-foreground" />;
  }
  return <FileText className="w-8 h-8 text-muted-foreground" />;
}

export default async function StoragePage() {
  const currentUser = await getCurrentUser();
  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';
  const files = await getStorageFiles();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="flex-1 text-2xl font-semibold">Almacenamiento</h1>
        {canEdit && (
            <UploadFileButton />
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {files.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-muted-foreground py-16">
                No hay archivos en el almacenamiento. ¡Sube el primero!
            </div>
        )}
        {files.map((file) => (
          <Card key={file.name}>
            <CardHeader className="relative">
              {canEdit && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                    <DropdownMenuItem>Descargar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 pt-0">
              {file.type.startsWith("image/") ? (
                <Image
                  src={file.url}
                  alt={file.name}
                  width={400}
                  height={300}
                  className="rounded-md aspect-[4/3] object-cover"
                  data-ai-hint={file.hint}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full aspect-[4/3] bg-muted rounded-md">
                   <FileIcon fileType={file.type} />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start text-sm">
                <p className="font-medium truncate w-full">{file.name}</p>
                <p className="text-muted-foreground">{file.size}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
