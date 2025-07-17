
import { firestoreAdmin, isFirebaseConfigured, storageAdmin } from './firebase-admin';
import { mockData, mockSchemas } from './mock-data-client';
import admin from 'firebase-admin';

async function ensureDefaultCollections() {
  if (!isFirebaseConfigured || !firestoreAdmin) {
    return;
  }
  
  try {
    const collectionsToEnsure = ['posts', 'projects'];
    for (const collectionName of collectionsToEnsure) {
        const schemaDocRef = firestoreAdmin.collection('_schemas').doc(collectionName);
        const dataCollectionRef = firestoreAdmin.collection(collectionName);
        
        const [schemaSnap, dataSnap] = await Promise.all([
            schemaDocRef.get(),
            dataCollectionRef.limit(1).get()
        ]).catch(err => {
            // This catch block is crucial for brand new projects where Firestore DB doesn't exist yet.
            // The error will be "NOT_FOUND", and we can safely ignore it and let the app use mock data.
            if (err.code !== 5) { // 5 is the gRPC code for NOT_FOUND
                console.error(`Error checking for default collections: ${String(err)}`);
            }
            return [null, null];
        });

        // If schemaSnap or dataSnap is null, it means the initial check failed (likely DB not found), so we abort.
        if (!schemaSnap || !dataSnap) continue;

        if (!schemaSnap.exists) {
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
             const mockCollectionData = mockData[collectionName];
            if (mockCollectionData?.length > 0) {
                const batch = firestoreAdmin.batch();
                mockCollectionData.forEach(doc => {
                    const docRef = dataCollectionRef.doc(doc.id);
                    // Create a mutable copy of the doc to avoid modifying the original mock data
                    const dataToSet: { [key: string]: any } = { ...doc };
                    delete dataToSet.id;
                    // Convert JS Dates in mock data to Firestore Timestamps
                    Object.keys(dataToSet).forEach(key => {
                        if (dataToSet[key] instanceof Date) {
                            dataToSet[key] = admin.firestore.Timestamp.fromDate(dataToSet[key]);
                        }
                    });
                    batch.set(docRef, dataToSet);
                });
                await batch.commit();
            }
        }
    }
  } catch (error) {
     if ((error as any).code !== 5) {
        console.error(`Error ensuring default collections:`, String(error));
     }
  }
}


export async function getCollections() {
  if (!isFirebaseConfigured || !firestoreAdmin) {
    console.warn("Firebase no está configurado. Devolviendo colecciones de demostración.");
    return Object.keys(mockSchemas).map(name => ({
        name,
        count: mockData[name]?.length || 0,
        schemaFields: (mockSchemas[name].definition.match(/:\s*z\./g) || []).length,
        lastUpdated: new Date().toISOString(),
        icon: mockSchemas[name].icon || null
    }));
  }

  await ensureDefaultCollections();

  try {
    const collectionRefs = await firestoreAdmin.listCollections();
    const collectionIds = collectionRefs
        .map(col => col.id)
        .filter(name => !name.startsWith('_'));

    if (collectionIds.length === 0) {
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

    return await Promise.all(promises);
  } catch (error) {
    if ((error as any).code !== 5) {
        console.error("Error fetching Firebase collections:", String(error));
    }
    return [];
  }
}

export async function getCollectionDocuments(collectionId: string): Promise<any[]> {
    if (!isFirebaseConfigured || !firestoreAdmin) {
        console.warn(`Firebase no está configurado. Devolviendo datos de demostración para la colección: ${collectionId}`);
        return mockData[collectionId] || [];
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
        if ((error as any).code !== 5) {
            console.error(`Error al obtener documentos para la colección "${collectionId}":`, String(error));
            console.warn(`Devolviendo datos de demostración para la colección "${collectionId}" debido a un error.`);
        }
        return mockData[collectionId] || [];
    }
}

export async function getCollectionSchema(collectionId: string): Promise<{ definition: string; icon: string | null }> {
    if (!isFirebaseConfigured || !firestoreAdmin) {
        const mockSchema = mockSchemas[collectionId];
        if (mockSchema) {
            return { definition: mockSchema.definition, icon: mockSchema.icon };
        }
        return { 
            definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  // Firebase no está configurado.\n});`,
            icon: null 
        };
    }

    try {
      const schemaDoc = await firestoreAdmin.collection('_schemas').doc(collectionId).get();
      if (schemaDoc.exists) {
          const data = schemaDoc.data();
          return { definition: data?.definition || '', icon: data?.icon || null };
      }

      // Fallback a la inferencia si el esquema no existe
      const collectionRef = firestoreAdmin.collection(collectionId);
      const snapshot = await collectionRef.limit(1).get();
      
      if (snapshot.empty) {
          return { definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  // La colección está vacía o no existe. No se puede inferir el esquema.\n});`, icon: null };
      }
      
      const firstItem = snapshot.docs[0].data();
      const getZodType = (value: any): string => {
          if (typeof value === 'string') {
              if (/\S+@\S+\.\S+/.test(value)) return 'z.string().email()';
              if (!isNaN(Date.parse(value))) return 'z.string().datetime()';
              return 'z.string()';
          }
          if (typeof value === 'number') return 'z.number()';
          if (typeof value === 'boolean') return 'z.boolean()';
          if (value === null) return 'z.any().nullable()';
          if (value && typeof value.toDate === 'function') return 'z.date()';
          return 'z.any()';
      }
      const schemaFields = Object.entries(firstItem)
          .map(([key, value]) => `  ${key}: ${getZodType(value)}`)
          .join(',\n');
      
      const definition = `import { z } from 'zod';\n\nexport const schema = z.object({\n${schemaFields}\n});`;
      return { definition, icon: null };
  
    } catch (error) {
      console.error(`Error al obtener el esquema de la colección para "${collectionId}":`, String(error));
      return { definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  // Ocurrió un error al obtener el esquema.\n});`, icon: null };
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

export async function getStorageFiles(pathPrefix?: string) {
    if (!isFirebaseConfigured || !storageAdmin) {
        return { files: [], folders: [] };
    }
    
    try {
        const bucket = storageAdmin.bucket();
        const [allFiles, , apiResponse] = await bucket.getFiles({ prefix: pathPrefix ? `${pathPrefix}/` : '', delimiter: '/' });
        const folders = apiResponse.prefixes?.map((p: string) => p.slice(0, -1)) || [];
        
        const filePromises = allFiles
          .filter(file => !file.name.endsWith('/'))
          .map(async (file) => {
            const [metadata] = await file.getMetadata();
            const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: '01-01-2100' });
            return {
                name: file.name,
                type: metadata.contentType || 'application/octet-stream',
                size: formatBytes(Number(metadata.size)),
                date: metadata.updated,
                url: signedUrl,
                hint: "file icon"
            };
        });
        
        const files = await Promise.all(filePromises);
        files.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { files, folders };
    } catch (error) {
        console.error("Error fetching Storage files:", String(error));
        return { files: [], folders: [] };
    }
}
