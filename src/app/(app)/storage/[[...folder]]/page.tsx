

import Image from "next/image"
import Link from "next/link"
import { FileText, FileImage, FileAudio, Folder as FolderIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getRequiredCurrentUser } from "@/lib/auth"
import { getStorageFiles } from "@/lib/data"
import { StorageActions } from "../components/storage-actions"
import { FileActionItems } from "../components/file-action-items"

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType.startsWith("image/")) {
    return <FileImage className="w-8 h-8 text-muted-foreground" />;
  }
  if (fileType.startsWith("audio/")) {
    return <FileAudio className="w-8 h-8 text-muted-foreground" />;
  }
  return <FileText className="w-8 h-8 text-muted-foreground" />;
}

export default async function StoragePage({ params }: { params: { folder?: string[] }}) {
  const currentUser = await getRequiredCurrentUser();
  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';
  
  const currentPath = params.folder ? params.folder.join('/') : '';
  const { files, folders } = await getStorageFiles(currentPath);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Almacenamiento</h1>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/storage">Almacenamiento</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {params.folder?.map((segment, index) => {
                        const href = `/storage/${params.folder?.slice(0, index + 1).join('/')}`;
                        const isLast = index === params.folder!.length - 1;
                        return (
                            <React.Fragment key={href}>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage>{segment}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={href}>{segment}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
        {canEdit && currentPath && <StorageActions currentFolder={currentPath} />}
      </div>
      
      {folders.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-muted-foreground">Carpetas</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                {folders.map((folder) => (
                    <Link href={`/storage/${folder}`} key={folder}>
                        <Card className="hover:bg-muted/50 transition-colors flex flex-col items-center justify-center p-6 gap-2">
                             <FolderIcon className="w-16 h-16 text-primary" />
                             <p className="font-medium truncate w-full text-center">{folder.split('/').pop()}</p>
                        </Card>
                    </Link>
                ))}
            </div>
            <h2 className="text-lg font-semibold text-muted-foreground pt-4">Archivos</h2>
          </>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {files.length === 0 && folders.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-muted-foreground py-16">
                No hay archivos en esta carpeta.
                 {!currentPath && (
                  <p>Sube uno para empezar o crea una nueva carpeta al subir.</p>
                )}
                 {canEdit && !currentPath && <div className="mt-4"><StorageActions /></div>}
            </div>
        )}
        {files.map((file) => (
          <Card key={file.name} className="relative group">
            <CardHeader className="h-10">
              {canEdit && (
                <FileActionItems file={file} />
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
                <p className="font-medium truncate w-full" title={file.name}>{file.name.split('/').pop()}</p>
                <p className="text-muted-foreground">{file.size}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
