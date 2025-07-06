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
            Save Changes
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
            toast({ title: "Topic too short", description: "Please provide a more detailed topic.", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            const result = await writingAssistantAction({ action: 'generate', topic });
            if (result.error) {
                toast({ title: "AI Error", description: result.error, variant: "destructive" });
            } else if (result.draft) {
                onDraftReceived(result.draft);
                setIsOpen(false);
                toast({ title: "Draft generated!", description: "The AI-generated content has been added to the editor." });
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Wand2 className="mr-2 h-4 w-4" />
                    AI Writing Assistant
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>AI Writing Assistant</DialogTitle>
                    <DialogDescription>
                        Describe the topic or section you want the AI to write about.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="topic">Topic / Headline</Label>
                        <Input 
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., 'The future of serverless computing'"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate
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
                    AI Tools
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onActionStart('paraphrase')}>Paraphrase</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onActionStart('summarize')}>Summarize</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onActionStart('expand')}>Expand</DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Change Tone</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => onActionStart('changeTone', 'Professional')}>Professional</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onActionStart('changeTone', 'Casual')}>Casual</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onActionStart('changeTone', 'Humorous')}>Humorous</DropdownMenuItem>
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
                title: state.success ? "Success" : "Error",
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
                const actionVerb = action === 'changeTone' ? `changed tone to ${tone}` : `${action}d`;
                toast({ title: "Content updated!", description: `The selected text has been ${actionVerb}.` });
            } else if (result.error) {
                toast({ title: "AI Error", description: result.error, variant: "destructive" });
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
                                <Label htmlFor="title" className="sr-only">Title</Label>
                                <Input id="title" name="title" placeholder="Post Title" defaultValue={document.title} className="text-2xl font-bold h-14 border-none shadow-none focus-visible:ring-0 px-0" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                                    <Label htmlFor="content" className="text-xs text-muted-foreground">Content (Markdown Supported)</Label>
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
                                            {viewMode === 'edit' ? 'Preview' : 'Edit'}
                                        </Button>
                                    </div>
                                </div>
                                {viewMode === 'edit' ? (
                                    <Textarea 
                                        id="content" 
                                        name="content" 
                                        ref={textAreaRef}
                                        placeholder="Write your post here..." 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        onSelect={handleSelectionChange}
                                        rows={20}
                                        className="font-mono !text-sm"
                                    />
                                ) : (
                                    <div className="prose dark:prose-invert w-full max-w-none rounded-md border border-input p-4 min-h-[480px]">
                                       <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "Nothing to preview."}</ReactMarkdown>
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
                             <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <input type="hidden" name="collectionId" value={collectionId} />
                            <input type="hidden" name="documentId" value={document.id} />
                            
                             <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" defaultValue={document.status}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Published">Published</SelectItem>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="publishedAt">Publication Date</Label>
                                <Input
                                    id="publishedAt"
                                    name="publishedAt"
                                    type="datetime-local"
                                    defaultValue={document.publishedAt ? new Date(document.publishedAt.toDate ? document.publishedAt.toDate() : document.publishedAt).toISOString().substring(0, 16) : ''}
                                />
                             </div>
                             <div className="grid gap-2">
                                <Label htmlFor="authorId">Author ID</Label>
                                <Input id="authorId" name="authorId" placeholder="Enter author user ID" defaultValue={document.authorId} />
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
