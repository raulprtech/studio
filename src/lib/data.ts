
import { firestoreAdmin, isFirebaseConfigured } from './firebase-admin';
import { getMode } from './mode';
import { mockData, mockSchemas } from './mock-data-client';
import admin from 'firebase-admin';

async function preloadCollection(collectionId: string) {
    if (!firestoreAdmin) return;
    const mockCollectionData = mockData[collectionId];
    if (!mockCollectionData || mockCollectionData.length === 0) {
        console.log(`No mock data to preload for collection '${collectionId}'.`);
        return;
    }

    console.log(`Preloading ${mockCollectionData.length} mock documents for collection '${collectionId}'...`);
    const collectionRef = firestoreAdmin.collection(collectionId);
    const batch = firestoreAdmin.batch();

    mockCollectionData.forEach(doc => {
        const docRef = collectionRef.doc(doc.id);
        const dataToSet: { [key: string]: any } = { ...doc };
        delete dataToSet.id;

        // Convert date objects to Timestamps
        Object.keys(dataToSet).forEach(key => {
            const value = dataToSet[key];
            if (value instanceof Date) {
                dataToSet[key] = admin.firestore.Timestamp.fromDate(value);
            }
        });

        batch.set(docRef, dataToSet);
    });

    await batch.commit();
    console.log(`Preloading complete for collection '${collectionId}'.`);
}


async function ensureDefaultSchemasAndData() {
    if (!firestoreAdmin) return;
    
    const schemasToEnsure = ['posts', 'projects'];

    for (const collectionName of schemasToEnsure) {
        const schemaDocRef = firestoreAdmin.collection('_schemas').doc(collectionName);
        const dataCollectionRef = firestoreAdmin.collection(collectionName);
        
        const [schemaSnap, dataSnap] = await Promise.all([
            schemaDocRef.get(),
            dataCollectionRef.limit(1).get()
        ]);

        if (!schemaSnap.exists) {
            console.log(`Schema for '${collectionName}' not found. Preloading...`);
            const mockSchema = mockSchemas[collectionName];
            if (mockSchema) {
                await schemaDocRef.set({
                    definition: mockSchema.definition,
                    icon: mockSchema.icon || null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }
        
        if (dataSnap.empty) {
            console.log(`Collection '${collectionName}' is empty. Preloading data...`);
             await preloadCollection(collectionName);
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
        await ensureDefaultSchemasAndData();

        const collectionRefs = await firestoreAdmin.listCollections();
        const collectionIds = collectionRefs
            .map(col => col.id)
            .filter(name => !name.startsWith('_'));

        if (collectionIds.length === 0) {
             console.warn("No user-defined collections found in Firestore after ensuring defaults.");
             return [];
        }

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

        const results = await Promise.all(promises);
        return results;

    } catch (error) {
        console.error("Error fetching Firebase collections:", String(error));
        // Return an empty array on error to prevent the page from crashing.
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
    if (getMode() !== 'live' || !isFirebaseConfigured) {
        console.warn(`Storage is not in live mode. Returning mock files.`);
        return mockData.storage || [];
    }
    
    if (!storageAdmin) {
        console.error("Storage Admin SDK not initialized. Returning empty list.");
        return [];
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
              .filter(file => !file.name.endsWith('/'))
              .map(async (file) => {
                const [metadata] = await file.getMetadata();
                const [signedUrl] = await file.getSignedUrl({
                    action: 'read',
                    expires: '01-01-2100',
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
        return [];
    }
}
