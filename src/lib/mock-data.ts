
import { firestoreAdmin, storageAdmin, isFirebaseConfigured } from './firebase-admin';
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

    console.log(`Collection '${collectionId}' is empty. Preloading ${mockCollectionData.length} mock documents...`);
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


export async function getCollectionDocuments(collectionId: string) {
  const collectionsToPreload = ['posts', 'projects'];

  if (getMode() !== 'live' || !isFirebaseConfigured || !firestoreAdmin) {
      console.warn(`Firebase is not in live mode. Returning mock data for collection: ${collectionId}`);
      return mockData[collectionId] || [];
  }

  try {
      const collectionRef = firestoreAdmin.collection(collectionId);
      let snapshot = await collectionRef.get();
      
      if (snapshot.empty && collectionsToPreload.includes(collectionId)) {
          await preloadCollection(collectionId);
          // Re-fetch after preloading
          snapshot = await collectionRef.get();
      }

      if (snapshot.empty) {
          return [];
      }
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
      console.error(`Error fetching documents for collection "${collectionId}":`, String(error));
      return [];
  }
}

export async function getCollectionSchema(collectionId: string): Promise<{ definition: string; icon: string | null }> {
    if (getMode() !== 'live' || !isFirebaseConfigured || !firestoreAdmin) {
        console.warn(`Firebase is not in live mode. Returning mock schema for collection: ${collectionId}`);
        const mock = mockSchemas[collectionId];
        if (mock) {
            return { definition: mock.definition, icon: mock.icon };
        }
        return { 
            definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  // The app is in demo mode. This is a default schema for '${collectionId}'.\n});`,
            icon: null 
        };
    }

    try {
      const schemaDoc = await firestoreAdmin.collection('_schemas').doc(collectionId).get();
      const data = schemaDoc.data();
      let definition = data?.definition;
      const icon = data?.icon || null;
  
      if (!definition) {
          const collectionRef = firestoreAdmin.collection(collectionId);
          const snapshot = await collectionRef.limit(1).get();
          
          if (snapshot.empty) {
              definition = `import { z } from 'zod';\n\nexport const schema = z.object({\n  // Collection is empty or does not exist. Cannot infer schema.\n});`;
          } else {
              const firstItem = snapshot.docs[0].data();
              const getZodType = (value: any): string => {
                  const type = typeof value;
                  if (type === 'string') {
                      if (/\S+@\S+\.\S+/.test(value)) return 'z.string().email({ message: "Invalid email address" })';
                      if (!isNaN(Date.parse(value))) return 'z.string().datetime()';
                      return 'z.string()';
                  }
                  if (type === 'number') return 'z.number()';
                  if (type === 'boolean') return 'z.boolean()';
                  if (value === null) return 'z.any().nullable()';
                  if (value && typeof value.toDate === 'function') return 'z.date()';
                  return 'z.any()';
              }
              const schemaFields = Object.entries(firstItem)
                  .map(([key, value]) => `  ${key}: ${getZodType(value)}`)
                  .join(',\n');
              
              definition = `import { z } from 'zod';\n\nexport const schema = z.object({\n${schemaFields}\n});`;
          }
      }

      return { definition, icon };
  
    } catch (error) {
      console.error(`Error getting collection schema for "${collectionId}":`, String(error));
      const definition = `import { z } from 'zod';\n\nexport const schema = z.object({\n  // An error occurred fetching the schema.\n  // Check server logs and Firebase configuration for details.\n});`;
      return { definition, icon: null };
    }
  }

async function fetchCollection(collectionName: string, limit: number) {
    if (!firestoreAdmin) throw new Error("Firestore not initialized");
    const snapshot = await firestoreAdmin.collection(collectionName).limit(limit).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getPublicStorageImages(limit: number) {
    if (!storageAdmin) throw new Error("Storage not initialized");

    const bucket = storageAdmin.bucket();
    const [files] = await bucket.getFiles({ maxResults: limit * 2 });
    
    const imageFiles = files.filter(file => file.metadata.contentType?.startsWith('image/')).slice(0, limit);

    const urls = await Promise.all(
        imageFiles.map(async (file) => {
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            });
            return {
                url,
                name: file.name,
                hint: "gallery image"
            };
        })
    );
    return urls;
}

export async function fetchPublicData() {
    if (getMode() !== 'live' || !isFirebaseConfigured) {
        console.warn("Firebase is not in live mode. Returning mock data for public page.");
        return {
            products: mockData.products.slice(0, 3),
            posts: mockData.posts.slice(0, 2),
            galleryImages: [
                { url: "https://placehold.co/600x400.png", name: "placeholder-1.png", hint: "abstract art" },
                { url: "https://placehold.co/600x400.png", name: "placeholder-2.png", hint: "nature landscape" },
                { url: "https://placehold.co/600x400.png", name: "placeholder-3.png", hint: "cityscape" },
                { url: "https://placehold.co/600x400.png", name: "placeholder-4.png", hint: "tech gadget" },
            ]
        }
    }

    try {
        const [products, posts, galleryImages] = await Promise.all([
            fetchCollection('products', 3),
            fetchCollection('posts', 2),
            getPublicStorageImages(4)
        ]);
        return { products, posts, galleryImages };
    } catch (error) {
        console.error("Error fetching public data from Firebase:", String(error));
        return {
            products: [],
            posts: [],
            galleryImages: []
        };
    }
}
