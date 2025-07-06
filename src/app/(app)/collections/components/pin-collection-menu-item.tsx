"use client";

import { usePinnedCollections } from "@/hooks/use-pinned-collections";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Bookmark, BookmarkMinus } from "lucide-react";

export function PinCollectionMenuItem({ collectionName }: { collectionName: string }) {
    const { isPinned, togglePin } = usePinnedCollections();
    const pinned = isPinned(collectionName);

    return (
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => togglePin(collectionName)}>
            {pinned ? <BookmarkMinus className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
            <span>{pinned ? "Unpin from sidebar" : "Pin to sidebar"}</span>
        </DropdownMenuItem>
    );
}
