
import { firestoreAdmin, isFirebaseConfigured, storageAdmin } from './firebase-admin';

export async function getCollections() {
  if (!isFirebaseConfigured || !firestoreAdmin) {
    console.warn("Firebase no está configurado. No se pueden obtener colecciones.");
    return [];
  }

  try {
    const schemasSnapshot = await firestoreAdmin.collection('_schemas').get();
    if (schemasSnapshot.empty) {
      return [];
    }

    const collectionDataPromises = schemasSnapshot.docs.map(async (schemaDoc) => {
      const collectionName = schemaDoc.id;
      const schemaData = schemaDoc.data();
      
      try {
        const countSnapshot = await firestoreAdmin.collection(collectionName).count().get();
        const schemaString = schemaData?.definition || '';
        const fieldCount = (schemaString.match(/:\s*z\./g) || []).length;
        
        return {
          name: collectionName,
          count: countSnapshot.data().count,
          schemaFields: fieldCount,
          lastUpdated: schemaData?.updatedAt?.toDate().toISOString() || new Date().toISOString(),
          icon: schemaData?.icon || null
        };
      } catch (error) {
        if ((error as any).code !== 5) {
             console.warn(`Could not get count for collection "${collectionName}": ${String(error)}`);
        }
        return null;
      }
    });

    const collections = (await Promise.all(collectionDataPromises)).filter(Boolean);
    return collections as { name: string; count: number; schemaFields: number; lastUpdated: string; icon: string | null; }[];

  } catch (error) {
    console.error("Error al obtener colecciones desde _schemas:", String(error));
    return [];
  }
}

export async function getCollectionDocuments(collectionId: string): Promise<any[]> {
    if (!isFirebaseConfigured || !firestoreAdmin) {
        console.warn(`Firebase no está configurado. No se pueden obtener documentos para la colección: ${collectionId}`);
        return [];
    }

    try {
        const collectionRef = firestoreAdmin.collection(collectionId);
        const snapshot = await collectionRef.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error al obtener documentos para la colección "${collectionId}":`, String(error));
        return [];
    }
}

export async function getCollectionSchema(collectionId: string): Promise<{ definition: string; icon: string | null }> {
    if (!isFirebaseConfigured || !firestoreAdmin) {
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
        if ((error as any).code !== 5) {
            console.error("Error fetching Storage files:", String(error));
        }
        return { files: [], folders: [] };
    }
}
