

import Image from "next/image"
import Link from "next/link"
import React from "react"
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
    return <FileImage className="w-16 h-16 text-muted-foreground" />;
  }
  if (fileType.startsWith("audio/")) {
    return <FileAudio className="w-16 h-16 text-muted-foreground" />;
  }
  return <FileText className="w-16 h-16 text-muted-foreground" />;
}

export default async function StoragePage({ params }: { params: { folder?: string[] }}) {
  const currentUser = await getRequiredCurrentUser();
  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';
  
  const currentPath = params.folder ? params.folder.join('/') : '';
  const { files, folders } = await getStorageFiles(currentPath);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start md:items-center">
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
        {canEdit && <StorageActions currentFolder={currentPath} />}
      </div>
      
      {folders.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-muted-foreground">Carpetas</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {folders.map((folder) => (
                    <Link href={`/storage/${folder}`} key={folder} className="group">
                        <div className="border rounded-lg p-6 flex flex-col items-center justify-center gap-2 aspect-square hover:bg-muted/50 transition-colors">
                             <FolderIcon className="w-16 h-16 text-primary" />
                             <p className="font-medium truncate w-full text-center text-sm">{folder.split('/').pop()}</p>
                        </div>
                    </Link>
                ))}
            </div>
            {(files.length > 0) && <h2 className="text-lg font-semibold text-muted-foreground pt-4">Archivos</h2>}
          </>
      )}

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {files.length === 0 && folders.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-16">
                <p className="mb-4">Esta carpeta está vacía.</p>
                {canEdit && <StorageActions currentFolder={currentPath} />}
            </div>
        )}
        {files.map((file) => (
          <Card key={file.name} className="relative group">
            {canEdit && (
              <CardHeader className="absolute top-0 right-0 z-10 p-2">
                <FileActionItems file={file} />
              </CardHeader>
            )}
            <CardContent className="flex flex-col items-center justify-center p-6 pt-8">
              {file.type.startsWith("image/") ? (
                <Image
                  src={file.url}
                  alt={file.name}
                  width={400}
                  height={300}
                  className="rounded-md aspect-video object-cover"
                  data-ai-hint={file.hint}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full aspect-video bg-muted rounded-md">
                   <FileIcon fileType={file.type} />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start text-sm p-4">
                <p className="font-medium truncate w-full" title={file.name}>{file.name.split('/').pop()}</p>
                <p className="text-muted-foreground">{file.size}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
