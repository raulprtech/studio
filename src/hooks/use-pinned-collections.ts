"use client";

import { useState, useEffect, useCallback } from "react";

const PINNED_COLLECTIONS_KEY = "pinnedCollections";

export function usePinnedCollections() {
    const [pinnedCollections, setPinnedCollections] = useState<string[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const item = window.localStorage.getItem(PINNED_COLLECTIONS_KEY);
            if (item) {
                setPinnedCollections(JSON.parse(item));
            }
        } catch (error) {
            console.error("Failed to read pinned collections from localStorage", error);
            setPinnedCollections([]);
        }
    }, []);

    const togglePin = useCallback((collectionId: string) => {
        setPinnedCollections(prev => {
            const newPinned = prev.includes(collectionId)
                ? prev.filter(id => id !== collectionId)
                : [...prev, collectionId];
            
            try {
                window.localStorage.setItem(PINNED_COLLECTIONS_KEY, JSON.stringify(newPinned));
            } catch (error) {
                console.error("Failed to save pinned collections to localStorage", error);
            }
            return newPinned;
        });
    }, []);

    const isPinned = useCallback((collectionId: string) => {
        return pinnedCollections.includes(collectionId);
    }, [pinnedCollections]);

    return { pinnedCollections, togglePin, isPinned, isClient };
}
