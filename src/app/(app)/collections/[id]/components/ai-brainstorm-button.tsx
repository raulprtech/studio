"use client";

import { useState, useTransition } from "react";
import { Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { getCollectionIdeasAction } from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type CollectionIdeasOutput } from "@/ai/flows/generate-collection-ideas";


export function AiBrainstormButton({ collectionName }: { collectionName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ideas, setIdeas] = useState<CollectionIdeasOutput['ideas'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset state when opening dialog
      setIdeas(null);
      setError(null);
      startTransition(async () => {
        const result = await getCollectionIdeasAction(collectionName);
        if (result.error) {
          setError(result.error);
        } else {
          setIdeas(result.ideas);
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Lightbulb className="mr-2 h-4 w-4" />
          Lluvia de Ideas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ideas Generadas por IA</DialogTitle>
          <DialogDescription>
            Nuevas ideas para la colección '{collectionName}' basadas en el contenido existente.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {isPending && (
             <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
             </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {ideas && (
            <Accordion type="single" collapsible className="w-full">
              {ideas.map((idea, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>{idea.title}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">{idea.description}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
