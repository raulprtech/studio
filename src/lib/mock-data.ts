



import { firestoreAdmin, isFirebaseConfigured } from './firebase-admin';
import { mockSchemas, mockData } from './mock-data-client';
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

async function ensureDefaultCollections() {
    if (!firestoreAdmin) return;
    
    const collectionsToEnsure = ['posts', 'projects'];

    for (const collectionName of collectionsToEnsure) {
        const schemaDocRef = firestoreAdmin.collection('_schemas').doc(collectionName);
        const dataCollectionRef = firestoreAdmin.collection(collectionName);
        
        try {
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
        } catch (error) {
             console.error(`Error ensuring default collections for ${collectionName}:`, String(error));
        }
    }
}


export async function getCollectionDocuments(collectionId: string) {
  if (!isFirebaseConfigured || !firestoreAdmin) {
      console.warn(`Firebase is not configured. Returning empty array for collection: ${collectionId}`);
      return [];
  }

  try {
      await ensureDefaultCollections();
      
      const collectionRef = firestoreAdmin.collection(collectionId);
      const snapshot = await collectionRef.get();
      
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
    if (!isFirebaseConfigured || !firestoreAdmin) {
        return { 
            definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  // Firebase is not configured.\n});`,
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

export async function fetchPublicData() {
    if (!isFirebaseConfigured) {
        return {
            projects: [],
            posts: [],
        }
    }

    try {
        const [projects, posts] = await Promise.all([
            fetchCollection('projects', 3),
            fetchCollection('posts', 2),
        ]);
        return { projects, posts };
    } catch (error) {
        console.error("Error fetching public data from Firebase:", String(error));
        return {
            projects: [],
            posts: [],
        };
    }
}
