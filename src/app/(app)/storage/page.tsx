import Image from "next/image"
import { Upload, MoreVertical, FileText, FileImage, FileAudio } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const files = [
  { name: "product-image-1.jpg", type: "image/jpeg", size: "1.2 MB", date: "2024-05-20", url: "https://placehold.co/400x300.png", hint: "product photo" },
  { name: "company-logo.svg", type: "image/svg+xml", size: "15 KB", date: "2024-05-18", url: "https://placehold.co/400x300.png", hint: "company logo" },
  { name: "terms-of-service.pdf", type: "application/pdf", size: "256 KB", date: "2024-05-15", url: "https://placehold.co/400x300.png", hint: "document icon" },
  { name: "user-guide-video.mp4", type: "video/mp4", size: "25 MB", date: "2024-05-12", url: "https://placehold.co/400x300.png", hint: "video play" },
  { name: "background-music.mp3", type: "audio/mpeg", size: "3.5 MB", date: "2024-05-10", url: "https://placehold.co/400x300.png", hint: "audio waveform" },
  { name: "product-image-2.jpg", type: "image/jpeg", size: "980 KB", date: "2024-05-21", url: "https://placehold.co/400x300.png", hint: "product photo" },
  { name: "marketing-banner.png", type: "image/png", size: "2.1 MB", date: "2024-05-19", url: "https://placehold.co/400x300.png", hint: "marketing banner" },
  { name: "annual-report.docx", type: "application/msword", size: "5.4 MB", date: "2024-04-30", url: "https://placehold.co/400x300.png", hint: "document icon" },
]

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType.startsWith("image/")) {
    return <FileImage className="w-8 h-8 text-muted-foreground" />;
  }
  if (fileType.startsWith("audio/")) {
    return <FileAudio className="w-8 h-8 text-muted-foreground" />;
  }
  return <FileText className="w-8 h-8 text-muted-foreground" />;
}

export default function StoragePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="flex-1 text-2xl font-semibold">Storage</h1>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {files.map((file) => (
          <Card key={file.name}>
            <CardHeader className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Download</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
