
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
                await preloadCollection(collectionName);
                console.log(`Successfully preloaded schema and data for '${collectionName}'.`);
            } else {
                console.warn(`Could not find a mock schema for '${collectionName}' to preload.`);
            }
        }
    }
}

export async function getCollections() {
    if (getMode() !== 'live' || !isFirebaseConfigured || !firestoreAdmin) {
        console.warn(`Firebase is not in live mode. Returning mock collections.`);
        return Object.keys(mockData).map(name => ({
            name,
            count: mockData[name]?.length || 0,
            schemaFields: Object.keys(mockData[name]?.[0] || {}).length,
            lastUpdated: new Date().toISOString(),
            icon: mockSchemas[name]?.icon || null,
        }));
    }

    try {
        await ensureDefaultSchemas();

        const collectionRefs = await firestoreAdmin.listCollections();
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
                    console.error(`Error fetching data for collection ${collectionIds[index]}:`, String(result.reason));
                    return null;
                }
            })
            .filter((c): c is NonNullable<Awaited<ReturnType<typeof promises[number]>>> => c !== null);

        return successfulCollections;

    } catch (error) {
        const errorMessage = String(error);
        if (errorMessage.includes('NOT_FOUND') || errorMessage.includes('Could not load the default credentials')) {
            console.warn(`Warning: Could not connect to Firestore. Has the database been created in your Firebase project, and are your service account credentials correct? The app will continue with an empty collection list. Original error: ${errorMessage}`);
        } else {
            console.error("Error listing Firebase collections:", errorMessage);
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
        console.warn(`Storage is not in live mode. Returning mock files.`);
        return mockData.storage || [];
    }

    try {
        const bucket = storageAdmin.bucket();
        const [bucketExists] = await bucket.exists();

        if (!bucketExists) {
            console.error(`Error: The storage bucket "${bucket.name}" does not exist. Please check your Firebase Storage settings and the 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET' environment variable.`);
            return [];
        }

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
                
                // Generate a long-lived signed URL for permanent access
                const [signedUrl] = await file.getSignedUrl({
                    action: 'read',
                    expires: '01-01-2100', // A very distant future date
                });

                return {
                    name: file.name,
                    type: metadata.contentType || 'application/octet-stream',
                    size: formatBytes(Number(metadata.size)),
                    date: metadata.updated,
                    url: signedUrl,
                    hint: "file icon"
                };
            })
        );
        return fileDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error) {
        console.error("Critical error fetching Storage files. Check your service account permissions and bucket configuration.", String(error));
        // Return an empty array on error to prevent page crash and avoid showing mock data.
        return [];
    }
}
