"use client";

import { useEffect, useState, useTransition, useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentAction, writingAssistantAction } from "@/lib/actions";
import { Loader2, Wand2, Eye, Pencil, Sparkles, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
} from "@/components/ui/dropdown-menu";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type AiAction = 'generate' | 'paraphrase' | 'summarize' | 'expand' | 'changeTone';
type Tone = 'Professional' | 'Casual' | 'Humorous';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
        </Button>
    );
}

function AiGenerateTool({ onDraftReceived }: { onDraftReceived: (draft: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [topic, setTopic] = useState("");
    const [isGenerating, startTransition] = useTransition();
    const { toast } = useToast();
    
    const handleGenerate = () => {
        if (topic.length < 5) {
            toast({ title: "Tema demasiado corto", description: "Por favor, proporciona un tema más detallado.", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            const result = await writingAssistantAction({ action: 'generate', topic });
            if (result.error) {
                toast({ title: "Error de IA", description: result.error, variant: "destructive" });
            } else if (result.draft) {
                onDraftReceived(result.draft);
                setIsOpen(false);
                toast({ title: "¡Borrador generado!", description: "El contenido generado por IA ha sido añadido al editor." });
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Wand2 className="mr-2 h-4 w-4" />
                    Asistente de Escritura IA
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asistente de Escritura IA</DialogTitle>
                    <DialogDescription>
                        Describe el tema o la sección sobre la que quieres que escriba la IA.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="topic">Tema / Titular</Label>
                        <Input 
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="ej., 'El futuro de la computación sin servidor'"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AiEditTools({ onTextEdited, selectedText, isGenerating, onActionStart }: { onTextEdited: (newText: string) => void, selectedText: string, isGenerating: boolean, onActionStart: (action: AiAction, tone?: Tone) => void }) {
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={!selectedText || isGenerating}>
                     {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Herramientas IA
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onActionStart('paraphrase')}>Parafrasear</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onActionStart('summarize')}>Resumir</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onActionStart('expand')}>Expandir</DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Cambiar Tono</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => onActionStart('changeTone', 'Professional')}>Profesional</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onActionStart('changeTone', 'Casual')}>Casual</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onActionStart('changeTone', 'Humorous')}>Humorístico</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


export function PostEditor({ collectionId, document }: { collectionId: string, document: any }) {
    const { toast } = useToast();
    const initialState = { message: null, success: false };
    const [state, dispatch] = useActionState(updateDocumentAction, initialState);
    
    // State for the editor content and view mode
    const [content, setContent] = useState(document.content || "");
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [isGenerating, startTransition] = useTransition();

    // State for text selection
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
    
    const handleDraftReceived = (draft: string) => {
        setContent(prev => `${prev}${prev ? '\n\n' : ''}${draft}`);
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
        if (!selectedText || !selectionRange) return;

        startTransition(async () => {
            const result = await writingAssistantAction({
                action,
                selectedText,
                tone,
                currentContent: content,
            });

            if (result.draft) {
                const newContent = content.substring(0, selectionRange.start) + result.draft + content.substring(selectionRange.end);
                setContent(newContent);
                setSelectedText("");
                setSelectionRange(null);
                const actionVerbMap: Record<AiAction, string> = {
                    generate: 'generado',
                    paraphrase: 'parafraseado',
                    summarize: 'resumido',
                    expand: 'expandido',
                    changeTone: `cambiado a tono ${tone}`
                }
                const actionVerb = actionVerbMap[action];
                toast({ title: "¡Contenido actualizado!", description: `El texto seleccionado ha sido ${actionVerb}.` });
            } else if (result.error) {
                toast({ title: "Error de IA", description: result.error, variant: "destructive" });
            }
        });
    };

    return (
        <form action={dispatch}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="sr-only">Título</Label>
                                <Input id="title" name="title" placeholder="Título del Post" defaultValue={document.title} className="text-2xl font-bold h-14 border-none shadow-none focus-visible:ring-0 px-0" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                                    <Label htmlFor="content" className="text-xs text-muted-foreground">Contenido (Soporta Markdown)</Label>
                                    <div className="flex items-center gap-2">
                                        <AiGenerateTool onDraftReceived={handleDraftReceived} />
                                        <AiEditTools 
                                            selectedText={selectedText}
                                            isGenerating={isGenerating}
                                            onActionStart={handleAiToolAction}
                                            onTextEdited={() => {}}
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}>
                                            {viewMode === 'edit' ? <Eye className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                                            {viewMode === 'edit' ? 'Vista Previa' : 'Editar'}
                                        </Button>
                                    </div>
                                </div>
                                {viewMode === 'edit' ? (
                                    <Textarea 
                                        id="content" 
                                        name="content" 
                                        ref={textAreaRef}
                                        placeholder="Escribe tu post aquí..." 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        onSelect={handleSelectionChange}
                                        rows={20}
                                        className="font-mono !text-sm"
                                    />
                                ) : (
                                    <div className="prose dark:prose-invert w-full max-w-none rounded-md border border-input p-4 min-h-[480px]">
                                       <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "Nada que previsualizar."}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-4">
                    <Card>
                        <CardHeader>
                             <CardTitle>Detalles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <input type="hidden" name="collectionId" value={collectionId} />
                            <input type="hidden" name="documentId" value={document.id} />
                            
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
