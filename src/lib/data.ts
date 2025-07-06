import { firestoreAdmin } from './firebase-admin';
import { isFirebaseLive } from './mode';
import { mockData, mockSchemas } from './mock-data';

export async function getCollections() {
    if (!isFirebaseLive()) {
        console.warn(`Firebase no está en modo real. Devolviendo colecciones de ejemplo.`);
        return Object.keys(mockData).map(name => ({
            name,
            count: mockData[name].length,
            schemaFields: Object.keys(mockData[name][0] || {}).length,
            lastUpdated: new Date().toISOString(),
            icon: mockSchemas[name]?.icon || null,
        }));
    }

    try {
        const collectionRefs = await firestoreAdmin!.listCollections();
        const collections = collectionRefs
            .map(col => col.id)
            .filter(name => !name.startsWith('_'));

        const collectionsData = await Promise.all(
            collections.map(async (name) => {
                const [schemaDoc, countSnapshot] = await Promise.all([
                    firestoreAdmin!.collection('_schemas').doc(name).get(),
                    // This is a more efficient way to get document count
                    firestoreAdmin!.collection(name).count().get()
                ]);

                const schemaData = schemaDoc.data();
                const schemaString = schemaData?.definition || '';
                // A simple regex to count fields in a Zod object schema.
                const fieldCount = (schemaString.match(/:\s*z\./g) || []).length;
                
                return {
                    name,
                    count: countSnapshot.data().count,
                    schemaFields: fieldCount,
                    lastUpdated: schemaData?.updatedAt?.toDate().toISOString() || new Date().toISOString(),
                    icon: schemaData?.icon || null
                };
            })
        );
        return collectionsData;
    } catch (error) {
        console.error("Error al obtener las colecciones de Firebase:", error);
        return [];
    }
}
