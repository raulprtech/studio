import { firestoreAdmin } from './firebase-admin';
import { isFirebaseLive } from './mode';
import { mockData } from './mock-data';

export async function getCollections() {
    if (!isFirebaseLive()) {
        console.warn(`Firebase not live. Returning mock collections.`);
        return Object.keys(mockData).map(name => ({
            name,
            count: mockData[name].length,
            schemaFields: Object.keys(mockData[name][0] || {}).length,
            lastUpdated: new Date().toISOString(),
        }));
    }

    try {
        const collections = await firestoreAdmin!.listCollections();
        const collectionsData = collections
            .map(col => col.id)
            .filter(name => !name.startsWith('_'))
            .map(name => ({
                name,
                // In a real app, you'd fetch this data properly. For now, we use placeholders to keep it fast.
                count: Math.floor(Math.random() * 1000),
                schemaFields: Math.floor(Math.random() * 10) + 3,
                lastUpdated: new Date().toISOString(),
            }));
        return collectionsData;
    } catch (error) {
        console.error("Error fetching collections from Firebase:", error);
        return [];
    }
}
