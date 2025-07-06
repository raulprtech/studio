"use client";

import { usePinnedCollections } from "@/hooks/use-pinned-collections";
import { Bookmark } from "lucide-react";

export function PinStatusIcon({ collectionName }: { collectionName: string }) {
    const { isPinned, isClient } = usePinnedCollections();

    if (!isClient || !isPinned(collectionName)) {
        return null;
    }

    return (
        <Bookmark className="h-4 w-4 text-primary ml-2 fill-primary" title="Pinned to sidebar" />
    );
}
