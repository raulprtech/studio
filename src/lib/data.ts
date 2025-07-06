

import { firestoreAdmin, isFirebaseConfigured, storageAdmin } from './firebase-admin';
import { getMode } from './mode';
import { mockData, mockSchemas } from './mock-data-client';

async function ensureDefaultSchemas() {
    if (!firestoreAdmin) return;
    
    const schemasToEnsure = ['posts', 'projects'];
    const schemasCollection = firestoreAdmin.collection('_schemas');

    for (const collectionName of schemasToEnsure) {
        const schemaDocRef = schemasCollection.doc(collectionName);
        const docSnap = await schemaDocRef.get();

        if (!docSnap.exists) {
            console.log(`Schema for '${collectionName}' not found in Firestore. Preloading...`);
            const mockSchema = mockSchemas[collectionName];
            if (mockSchema) {
                await schemaDocRef.set({
                    definition: mockSchema.definition,
                    icon: mockSchema.icon || null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                console.log(`Successfully preloaded schema for '${collectionName}'.`);
            } else {
                console.warn(`Could not find a mock schema for '${collectionName}' to preload.`);
            }
        }
    }
}

export async function getCollections() {
    if (getMode() !== 'live' || !isFirebaseConfigured) {
        console.warn(`Firebase no está en modo real. Devolviendo colecciones de ejemplo.`);
        return Object.keys(mockData).map(name => ({
            name,
            count: mockData[name]?.length || 0,
            schemaFields: Object.keys(mockData[name]?.[0] || {}).length,
            lastUpdated: new Date().toISOString(),
            icon: mockSchemas[name]?.icon || null,
        }));
    }

    try {
        // Ensure that the default schemas for 'posts' and 'projects' exist.
        await ensureDefaultSchemas();

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
                    console.error(`Error al obtener datos para la colección ${collectionIds[index]}:`, String(result.reason));
                    return null;
                }
            })
            .filter((c): c is NonNullable<Awaited<ReturnType<typeof promises[number]>>> => c !== null);

        return successfulCollections;

    } catch (error) {
        const errorMessage = String(error);
        // This specific error code (5 NOT_FOUND) often means the Firestore database hasn't been created yet.
        // We'll treat it as a warning instead of a critical error to avoid breaking the app layout in dev mode.
        if (errorMessage.includes('NOT_FOUND')) {
            console.warn(`Advertencia de Firebase: No se encontró la base de datos de Firestore. ¿La has creado en tu proyecto de Firebase? La aplicación continuará con una lista de colecciones vacía. Error original: ${errorMessage}`);
        } else {
            console.error("Error al listar las colecciones de Firebase:", errorMessage);
        }
        return [];
    }
}


function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}


export async function getStorageFiles() {
    if (getMode() !== 'live' || !isFirebaseConfigured || !storageAdmin) {
        console.warn(`Storage no está en modo real. Devolviendo archivos de ejemplo.`);
        return mockData.storage || [];
    }

    try {
        const bucket = storageAdmin.bucket();
        const [files] = await bucket.getFiles({ maxResults: 50 });

        if (files.length === 0) {
            return [];
        }

        const fileDetails = await Promise.all(
            files
              // Filter out "folder" objects
              .filter(file => !file.name.endsWith('/'))
              .map(async (file) => {
                const [metadata] = await file.getMetadata();
                
                // Construct the public URL directly.
                // This assumes files are made public on upload.
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

                return {
                    name: file.name,
                    type: metadata.contentType || 'application/octet-stream',
                    size: formatBytes(Number(metadata.size)),
                    date: metadata.updated,
                    url: publicUrl,
                    hint: "file icon"
                };
            })
        );
        return fileDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error) {
        console.error("Error crítico al obtener archivos de Storage. Revisa los permisos de tu cuenta de servicio y la configuración del bucket.", String(error));
        // Return an empty array on error to prevent page crash and avoid showing mock data.
        return [];
    }
}
