
import { firestoreAdmin, isFirebaseConfigured } from './firebase-admin';
import { getMode } from './mode';
import { mockData, mockSchemas } from './mock-data-client';

export async function getCollections() {
    if (getMode() !== 'live' || !isFirebaseConfigured) {
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
        const collectionIds = collectionRefs
            .map(col => col.id)
            .filter(name => !name.startsWith('_'));

        const promises = collectionIds.map(async (name) => {
            const [schemaDoc, countSnapshot] = await Promise.all([
                firestoreAdmin!.collection('_schemas').doc(name).get(),
                firestoreAdmin!.collection(name).count().get()
            ]);

            const schemaData = schemaDoc.data();
            const schemaString = schemaData?.definition || '';
            const fieldCount = (schemaString.match(/:\s*z\./g) || []).length;
            
            return {
                name,
                count: countSnapshot.data().count,
                schemaFields: fieldCount,
                lastUpdated: schemaData?.updatedAt?.toDate().toISOString() || new Date().toISOString(),
                icon: schemaData?.icon || null
            };
        });

        const results = await Promise.allSettled(promises);
        
        const successfulCollections = results
            .map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    console.error(`Error al obtener datos para la colección ${collectionIds[index]}:`, result.reason);
                    return null;
                }
            })
            .filter((c): c is NonNullable<Awaited<ReturnType<typeof promises[number]>>> => c !== null);

        return successfulCollections;

    } catch (error) {
        console.error("Error al listar las colecciones de Firebase:", error);
        return [];
    }
}
