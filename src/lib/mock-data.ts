

import { firestoreAdmin, storageAdmin, isFirebaseConfigured } from './firebase-admin';
import { getMode } from './mode';
import { mockData, mockSchemas } from './mock-data-client';
import admin from 'firebase-admin';

async function preloadCollection(collectionId: string) {
    if (!firestoreAdmin) return;
    const mockCollectionData = mockData[collectionId];
    if (!mockCollectionData || mockCollectionData.length === 0) {
        console.log(`No hay datos de ejemplo para precargar en la colección '${collectionId}'.`);
        return;
    }

    console.log(`La colección '${collectionId}' está vacía. Precargando ${mockCollectionData.length} documentos de ejemplo...`);
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
    console.log(`Precarga completada para la colección '${collectionId}'.`);
}


export async function getCollectionDocuments(collectionId: string) {
  const collectionsToPreload = ['posts', 'projects'];

  if (getMode() !== 'live' || !isFirebaseConfigured) {
      console.warn(`Firebase no está en modo real. Devolviendo datos de ejemplo para la colección: ${collectionId}`);
      return mockData[collectionId] || [];
  }

  try {
      const collectionRef = firestoreAdmin!.collection(collectionId);
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
      console.error(`Error al obtener documentos para la colección "${collectionId}":`, String(error));
      return [];
  }
}

export async function getCollectionSchema(collectionId: string): Promise<{ definition: string; icon: string | null }> {
    if (getMode() !== 'live' || !isFirebaseConfigured) {
        console.warn(`Firebase no está en modo real. Devolviendo esquema de ejemplo para la colección: ${collectionId}`);
        const mock = mockSchemas[collectionId];
        if (mock) {
            return { definition: mock.definition, icon: mock.icon };
        }
        return { 
            definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  // La aplicación está en modo demo. Este es un esquema por defecto para '${collectionId}'.\n});`,
            icon: null 
        };
    }

    try {
      const schemaDoc = await firestoreAdmin!.collection('_schemas').doc(collectionId).get();
      const data = schemaDoc.data();
      let definition = data?.definition;
      const icon = data?.icon || null;
  
      if (!definition) {
          const collectionRef = firestoreAdmin!.collection(collectionId);
          const snapshot = await collectionRef.limit(1).get();
          
          if (snapshot.empty) {
              definition = "z.object({\n  // La colección está vacía o no existe. No se puede inferir el esquema.\n});";
          } else {
              const firstItem = snapshot.docs[0].data();
              const getZodType = (value: any): string => {
                  const type = typeof value;
                  if (type === 'string') {
                      if (/\S+@\S+\.\S+/.test(value)) return 'z.string().email({ message: "Dirección de correo inválida" })';
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
      console.error(`Error al obtener el esquema de la colección para "${collectionId}":`, String(error));
      const definition = `import { z } from 'zod';\n\nexport const schema = z.object({\n  // Ocurrió un error al obtener el esquema.\n  // Revisa los logs del servidor y la configuración de Firebase para más detalles.\n});`;
      return { definition, icon: null };
    }
  }

async function fetchCollection(collectionName: string, limit: number) {
    if (!firestoreAdmin) throw new Error("Firestore no inicializado");
    const snapshot = await firestoreAdmin.collection(collectionName).limit(limit).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getPublicStorageImages(limit: number) {
    if (!storageAdmin) throw new Error("Almacenamiento no inicializado");

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
        console.warn("Firebase no está en modo real. Devolviendo datos de ejemplo para la página pública.");
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
        console.error("Error al obtener datos públicos de Firebase:", String(error));
        return {
            products: [],
            posts: [],
            galleryImages: []
        };
    }
}
