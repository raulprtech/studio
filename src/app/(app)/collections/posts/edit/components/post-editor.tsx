
"use client";

import { useEffect, useState, useTransition, useActionState, useRef, type RefObject } from "react";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentAction, writingAssistantAction, uploadFileAction } from "@/lib/actions";
import { Loader2, Wand2, Eye, Pencil, Sparkles, ChevronDown, Heading1, Heading2, Heading3, Bold, Italic, Strikethrough, Code, Link as LinkIcon, List, ListOrdered, Quote, Image as ImageIcon, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type AiAction = 'generate' | 'paraphrase' | 'summarize' | 'expand' | 'changeTone';
type Tone = 'Professional' | 'Casual' | 'Humorous';

// #region Helper Components

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
        </Button>
    );
}

function ImageUploadDialog({ open, onOpenChange, onImageUploaded }: { open: boolean, onOpenChange: (open: boolean) => void, onImageUploaded: (url: string) => void}) {
    const [isUploading, startUploading] = useTransition();
    const { toast } = useToast();

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        startUploading(async () => {
            const result = await uploadFileAction(formData, 'articles');
            if (result.success && result.url) {
                onImageUploaded(result.url);
                toast({ title: "Imagen Subida", description: "La imagen se ha insertado en tu artículo." });
                onOpenChange(false);
            } else {
                toast({ title: "Error de Subida", description: result.error || "No se pudo subir la imagen.", variant: "destructive" });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Insertar Imagen</DialogTitle>
                    <DialogDescription>Sube una imagen para insertarla en tu artículo.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                    {isUploading && <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" /> Subiendo...</div>}
                </div>
            </DialogContent>
        </Dialog>
    );
}


function EditorToolbar({ editorRef, applyFormat, insertText, onAiAction, isAiGenerating, selectedText }: { editorRef: RefObject<HTMLTextAreaElement>, applyFormat: (format: string) => void, insertText: (text: string) => void, onAiAction: (action: AiAction, tone?: Tone) => void, isAiGenerating: boolean, selectedText: string }) {
    
    const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);

    return (
        <>
        <ImageUploadDialog open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen} onImageUploaded={(url) => insertText(`\n![imagen](${url})\n`)} />
        <div className="flex items-center gap-1 p-2 border-b flex-wrap bg-muted rounded-t-md">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">Estilo <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => applyFormat('h1')}><Heading1 className="mr-2 h-4 w-4" />Encabezado 1</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => applyFormat('h2')}><Heading2 className="mr-2 h-4 w-4" />Encabezado 2</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => applyFormat('h3')}><Heading3 className="mr-2 h-4 w-4" />Encabezado 3</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={() => applyFormat('bold')} title="Negrita"><Bold className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => applyFormat('italic')} title="Cursiva"><Italic className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => applyFormat('strikethrough')} title="Tachado"><Strikethrough className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => applyFormat('code')} title="Código"><Code className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setIsImageUploadOpen(true)} title="Insertar Imagen"><ImageIcon className="h-4 w-4" /></Button>
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">Más <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                     <DropdownMenuItem onSelect={() => applyFormat('quote')}><Quote className="mr-2 h-4 w-4" />Cita</DropdownMenuItem>
                     <DropdownMenuItem onSelect={() => applyFormat('code-block')}><Code className="mr-2 h-4 w-4" />Bloque de Código</DropdownMenuItem>
                     <DropdownMenuItem onSelect={() => applyFormat('link')}><LinkIcon className="mr-2 h-4 w-4" />Enlace</DropdownMenuItem>
                     <DropdownMenuItem onSelect={() => insertText('\n---\n')}><Minus className="mr-2 h-4 w-4" />Divisor</DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onSelect={() => applyFormat('ul')}><List className="mr-2 h-4 w-4" />Lista</DropdownMenuItem>
                     <DropdownMenuItem onSelect={() => applyFormat('ol')}><ListOrdered className="mr-2 h-4 w-4" />Lista Numerada</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-grow" />

            <AiTools selectedText={selectedText} isGenerating={isAiGenerating} onActionStart={onAiAction} />
        </div>
        </>
    );
}

function AiTools({ selectedText, isGenerating, onActionStart }: { selectedText: string, isGenerating: boolean, onActionStart: (action: AiAction, tone?: Tone) => void }) {
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [topic, setTopic] = useState("");
    const { toast } = useToast();

     const handleGenerate = () => {
        if (topic.length < 5) {
            toast({ title: "Tema demasiado corto", description: "Por favor, proporciona un tema más detallado.", variant: "destructive" });
            return;
        }
        onActionStart('generate', undefined);
        setIsGenerateOpen(false);
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                     {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Asistente IA
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                 <DropdownMenuItem onSelect={() => onActionStart('generate')}>Generar Sección (desde tema)...</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={!selectedText} onSelect={() => onActionStart('paraphrase')}>Parafrasear selección</DropdownMenuItem>
                <DropdownMenuItem disabled={!selectedText} onSelect={() => onActionStart('summarize')}>Resumir selección</DropdownMenuItem>
                <DropdownMenuItem disabled={!selectedText} onSelect={() => onActionStart('expand')}>Expandir selección</DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger disabled={!selectedText}>Cambiar Tono</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onSelect={() => onActionStart('changeTone', 'Professional')}>Profesional</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onActionStart('changeTone', 'Casual')}>Casual</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onActionStart('changeTone', 'Humorous')}>Humorístico</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


// #endregion

export function PostEditor({ collectionId, document }: { collectionId: string, document: any }) {
    const { toast } = useToast();
    const initialState = { message: null, success: false };
    const [state, dispatch] = useActionState(updateDocumentAction, initialState);
    
    const [content, setContent] = useState(document.content || "");
    const [coverImageUrl, setCoverImageUrl] = useState(document.coverImageUrl || null);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [isUploading, startUploading] = useTransition();
    const [isAiGenerating, startAiTransition] = useTransition();
    
    const [selectedText, setSelectedText] = useState("");
    const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Éxito" : "Error",
                description: state.message,
                variant: state.success ? "default" : "destructive",
            });
        }
    }, [state, toast]);
    
    const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        startUploading(async () => {
            const result = await uploadFileAction(formData, 'covers');
            if (result.success && result.url) {
                setCoverImageUrl(result.url);
                toast({ title: "Éxito", description: "Imagen de portada subida." });
            } else {
                toast({ title: "Error de Subida", description: result.error, variant: "destructive" });
            }
        });
    };
    
    const insertText = (textToInsert: string) => {
        const textarea = textAreaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + textToInsert + content.substring(end);
        setContent(newContent);
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
        }, 0);
    }
    
    const applyFormat = (format: string) => {
        const textarea = textAreaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        let selectedText = content.substring(start, end);

        let prefix = "";
        let suffix = "";
        let placeholder = "";

        switch(format) {
            case 'h1': prefix = '# '; break;
            case 'h2': prefix = '## '; break;
            case 'h3': prefix = '### '; break;
            case 'bold': prefix = '**'; suffix = '**'; placeholder = 'texto en negrita'; break;
            case 'italic': prefix = '*'; suffix = '*'; placeholder = 'texto en cursiva'; break;
            case 'strikethrough': prefix = '~~'; suffix = '~~'; placeholder = 'texto tachado'; break;
            case 'code': prefix = '`'; suffix = '`'; placeholder = 'código'; break;
            case 'quote': prefix = '> '; break;
            case 'link': prefix = '['; suffix = '](https://)'; placeholder = 'texto del enlace'; break;
            case 'code-block': prefix = '```\n'; suffix = '\n```'; placeholder = 'código aquí'; break;
            case 'ul': prefix = '- '; break;
            case 'ol': prefix = '1. '; break;
        }

        let newContent = "";
        let newCursorPos = 0;

        if (!selectedText) selectedText = placeholder;
        
        if (['h1', 'h2', 'h3', 'quote', 'ul', 'ol'].includes(format)) {
            const lineStart = content.lastIndexOf('\n', start - 1) + 1;
            newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart);
            newCursorPos = start + prefix.length;
        } else {
            newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
            newCursorPos = start + prefix.length + selectedText.length + suffix.length;
        }

        setContent(newContent);
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
    };

    const handleSelectionChange = () => {
        const textarea = textAreaRef.current;
        if (textarea) {
            const { selectionStart, selectionEnd } = textarea;
            if (selectionStart !== selectionEnd) {
                setSelectedText(textarea.value.substring(selectionStart, selectionEnd));
                setSelectionRange({ start: selectionStart, end: selectionEnd });
            } else {
                setSelectedText("");
                setSelectionRange(null);
            }
        }
    };

    const handleAiToolAction = (action: AiAction, tone?: Tone) => {
        startAiTransition(async () => {
            let result;
            if (action === 'generate') {
                const topic = prompt("Introduce el tema para la nueva sección:");
                if (!topic) return;
                result = await writingAssistantAction({ action, topic, currentContent: content });
            } else {
                 if (!selectedText || !selectionRange) return;
                 result = await writingAssistantAction({ action, selectedText, tone, currentContent: content });
            }
            
            if (result.draft) {
                if (action === 'generate') {
                     setContent(prev => `${prev}${prev ? '\n\n' : ''}${result.draft}`);
                } else if (selectionRange) {
                    const newContent = content.substring(0, selectionRange.start) + result.draft + content.substring(selectionRange.end);
                    setContent(newContent);
                    setSelectedText("");
                    setSelectionRange(null);
                }
                toast({ title: "¡Contenido actualizado por IA!" });
            } else if (result.error) {
                toast({ title: "Error de IA", description: result.error, variant: "destructive" });
            }
        });
    };


    return (
        <form action={dispatch}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-0">
                            <div className="grid gap-2 p-4">
                                <Label htmlFor="title" className="sr-only">Título</Label>
                                <Input id="title" name="title" placeholder="Título del Post" defaultValue={document.title} className="text-2xl font-bold h-14 border-none shadow-none focus-visible:ring-0 px-0" />
                            </div>
                           
                            <EditorToolbar 
                                editorRef={textAreaRef}
                                applyFormat={applyFormat}
                                insertText={insertText}
                                onAiAction={handleAiToolAction}
                                isAiGenerating={isAiGenerating}
                                selectedText={selectedText}
                            />

                            {viewMode === 'edit' ? (
                                <Textarea 
                                    id="content" 
                                    name="content" 
                                    ref={textAreaRef}
                                    placeholder="Escribe tu post aquí..." 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    onSelect={handleSelectionChange}
                                    rows={25}
                                    className="font-mono !text-sm border-0 border-t border-b rounded-none focus-visible:ring-0"
                                />
                            ) : (
                                <div className="prose dark:prose-invert w-full max-w-none p-4 min-h-[580px]">
                                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "Nada que previsualizar."}</ReactMarkdown>
                                </div>
                            )}

                             <div className="p-2 border-t flex justify-end">
                                <Button type="button" variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}>
                                    {viewMode === 'edit' ? <Eye className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                                    {viewMode === 'edit' ? 'Vista Previa' : 'Editar'}
                                </Button>
                             </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-4">
                    <Card>
                        <CardHeader>
                             <CardTitle>Detalles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <input type="hidden" name="collectionId" value={collectionId} />
                            <input type="hidden" name="documentId" value={document.id} />
                            <input type="hidden" name="coverImageUrl" value={coverImageUrl || ""} />

                             <div className="grid gap-2">
                                <Label>Imagen de Portada</Label>
                                {coverImageUrl && <Image src={coverImageUrl} alt="Preview" width={1200} height={630} className="rounded-md aspect-video object-cover" data-ai-hint="post cover" />}
                                <Input type="file" onChange={handleCoverImageUpload} disabled={isUploading} className="text-xs"/>
                                {isUploading && <p className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin h-3 w-3" /> Subiendo...</p>}
                             </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoría</Label>
                                <Input id="category" name="category" placeholder="Ej. Desarrollo Web" defaultValue={document.category} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
                                <Input id="tags" name="tags" placeholder="Ej. React, Next.js, Firebase" defaultValue={document.tags?.join(', ') || ''} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="status">Estado</Label>
                                <Select name="status" defaultValue={document.status}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Published">Publicado</SelectItem>
                                        <SelectItem value="Draft">Borrador</SelectItem>
                                        <SelectItem value="Archived">Archivado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="publishedAt">Fecha de Publicación</Label>
                                <Input
                                    id="publishedAt"
                                    name="publishedAt"
                                    type="datetime-local"
                                    defaultValue={document.publishedAt ? new Date(document.publishedAt.toDate ? document.publishedAt.toDate() : document.publishedAt).toISOString().substring(0, 16) : ''}
                                />
                             </div>
                             <div className="grid gap-2">
                                <Label htmlFor="authorId">ID de Autor</Label>
                                <Input id="authorId" name="authorId" placeholder="Introduce el ID de usuario del autor" defaultValue={document.authorId} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <SubmitButton />
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </form>
    );
}
