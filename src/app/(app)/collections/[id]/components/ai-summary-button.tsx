"use client";

import { useState, useTransition } from "react";
import { BrainCircuit } from "lucide-react";

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
import { getCollectionSummaryAction } from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AiSummaryButton({ collectionName }: { collectionName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset state when opening dialog
      setSummary(null);
      setError(null);
      startTransition(async () => {
        const result = await getCollectionSummaryAction(collectionName);
        if (result.error) {
          setError(result.error);
        } else {
          setSummary(result.summary);
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BrainCircuit className="mr-2 h-4 w-4" />
          Resumen con IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resumen Generado por IA</DialogTitle>
          <DialogDescription>
            Un resumen de la colección '{collectionName}' generado por Google AI.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isPending && (
             <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
             </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
