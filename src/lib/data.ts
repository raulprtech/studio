

import { firestoreAdmin, isFirebaseConfigured, storageAdmin } from './firebase-admin';

export async function getCollections() {
  if (!isFirebaseConfigured || !firestoreAdmin) {
    console.error("ERROR: Firebase no está configurado. No se pueden obtener colecciones.");
    return [];
  }

  try {
    const schemasSnapshot = await firestoreAdmin.collection('_schemas').get();
    if (schemasSnapshot.empty) {
      console.log("La colección '_schemas' está vacía o no existe.");
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
        console.warn(`No se pudo obtener el conteo para la colección "${collectionName}": ${String(error)}`);
        // Return a representation of the collection even if count fails
        return {
          name: collectionName,
          count: 0,
          schemaFields: 0,
          lastUpdated: schemaData?.updatedAt?.toDate().toISOString() || new Date().toISOString(),
          icon: schemaData?.icon || null
        };
      }
    });

    const collections = (await Promise.all(collectionDataPromises)).filter(Boolean);
    return collections as { name: string; count: number; schemaFields: number; lastUpdated: string; icon: string | null; }[];

  } catch (error: any) {
    console.error("Error crítico al obtener la lista de colecciones desde _schemas:", String(error));
    return [];
  }
}

export async function getCollectionDocuments(collectionId: string): Promise<any[]> {
    if (!isFirebaseConfigured || !firestoreAdmin) {
        console.error(`ERROR: Firebase no está configurado. No se pueden obtener documentos para la colección: ${collectionId}`);
        return [];
    }

    try {
        const collectionRef = firestoreAdmin.collection(collectionId);
        const snapshot = await collectionRef.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
        console.error(`Error al obtener documentos para la colección "${collectionId}":`, String(error));
        return [];
    }
}

export async function getCollectionSchema(collectionId: string): Promise<{ definition: string; icon: string | null }> {
    if (!isFirebaseConfigured || !firestoreAdmin) {
      return { 
          definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  // Firebase no está configurado.\n});`,
          icon: 'AlertCircle' 
      };
    }

    try {
      const schemaDoc = await firestoreAdmin.collection('_schemas').doc(collectionId).get();
      if (schemaDoc.exists) {
          const data = schemaDoc.data();
          return { definition: data?.definition || '', icon: data?.icon || null };
      }
      
      return { definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  // No se encontró un esquema para esta colección en '_schemas'.\n});`, icon: 'HelpCircle' };
  
    } catch (error: any) {
      console.error(`Error al obtener el esquema de la colección para "${collectionId}":`, String(error));
      return { definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  // Ocurrió un error al obtener el esquema.\n});`, icon: 'AlertTriangle' };
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
