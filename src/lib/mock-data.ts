
import { firestoreAdmin, storageAdmin } from './firebase-admin';
import { isFirebaseLive } from './mode';

export const mockData: { [key: string]: any[] } = {
  users: [
    { id: "user-1", uid: "user-1", email: "alice@example.com", name: "Alice Johnson", role: "Admin", createdAt: "2024-01-15", disabled: false },
    { id: "user-2", uid: "user-2", email: "bob@example.com", name: "Bob Williams", role: "Editor", createdAt: "2024-02-20", disabled: false },
    { id: "user-3", uid: "user-3", email: "charlie@example.com", name: "Charlie Brown", role: "Viewer", createdAt: "2024-03-10", disabled: true },
  ],
  posts: [
    { id: "post-1", title: "Primeros Pasos con Next.js", status: "Publicado", authorId: "user-1", publishedAt: new Date("2024-05-10"), content: "Una guía detallada sobre cómo configurar un nuevo proyecto de Next.js.", coverImageUrl: "https://placehold.co/1200x630.png", category: "Desarrollo Web", tags: ["Next.js", "React", "JavaScript"] },
    { id: "post-2", title: "Tailwind CSS Avanzado", status: "Borrador", authorId: "user-2", publishedAt: null, content: "Descubre técnicas avanzadas para estilizar con Tailwind CSS.", coverImageUrl: "https://placehold.co/1200x630.png", category: "Diseño Web", tags: ["CSS", "UI/UX", "Tailwind"] },
    { id: "post-3", title: "Inmersión Profunda en Firebase Authentication", status: "Publicado", authorId: "user-1", publishedAt: new Date("2024-04-22"), content: "Aprende a implementar autenticación segura con Firebase. Es una herramienta poderosa.", coverImageUrl: "https://placehold.co/1200x630.png", category: "Tecnología", tags: ["Firebase", "Auth", "Seguridad"] },
    { id: "post-4", title: "Gestión de Estado en React", status: "Publicado", authorId: "user-1", publishedAt: new Date("2024-03-15"), content: "Explorando diferentes soluciones para la gestión de estado en React: Context, Redux, y Zustand.", coverImageUrl: "https://placehold.co/1200x630.png", category: "Desarrollo Web", tags: ["React", "State Management", "Zustand"] },
    { id: "post-5", title: "Optimización de Rendimiento en Next.js", status: "Publicado", authorId: "user-2", publishedAt: new Date("2024-02-28"), content: "Técnicas para hacer que tus aplicaciones Next.js sean increíblemente rápidas.", coverImageUrl: "https://placehold.co/1200x630.png", category: "Desarrollo Web", tags: ["Next.js", "Performance", "Web Vitals"] },
    { id: "post-6", title: "Introducción a Firestore", status: "Publicado", authorId: "user-1", publishedAt: new Date("2024-01-30"), content: "Una guía para principiantes sobre la base de datos NoSQL de Firebase, Firestore.", coverImageUrl: "https://placehold.co/1200x630.png", category: "Tecnología", tags: ["Firebase", "Firestore", "Base de datos"] },
    { id: "post-7", title: "Creando Componentes Reutilizables", status: "Publicado", authorId: "user-2", publishedAt: new Date("2023-12-20"), content: "Principios de diseño y buenas prácticas para crear componentes de UI robustos y reutilizables.", coverImageUrl: "https://placehold.co/1200x630.png", category: "Diseño Web", tags: ["React", "Diseño de Componentes", "UI"] },
    { id: "post-8", title: "Desplegando una App en Vercel", status: "Publicado", authorId: "user-1", publishedAt: new Date("2023-11-10"), content: "Un tutorial paso a paso para desplegar tu aplicación Next.js en Vercel.", coverImageUrl: "https://placehold.co/1200x630.png", category: "Desarrollo Web", tags: ["Next.js", "Vercel", "DevOps"] },
    { id: "post-9", title: "Seguridad en Aplicaciones Web", status: "Publicado", authorId: "user-2", publishedAt: new Date("2023-10-05"), content: "Conceptos fundamentales de seguridad que todo desarrollador web debe conocer.", coverImageUrl: "https://placehold.co/1200x630.png", category: "Tecnología", tags: ["Seguridad", "OWASP", "Web"] },
    { id: "post-10", title: "El Ecosistema de TypeScript", status: "Publicado", authorId: "user-1", publishedAt: new Date("2023-09-01"), content: "Un vistazo al ecosistema de TypeScript y por qué deberías usarlo.", coverImageUrl: "https://placehold.co/1200x630.png", category: "Desarrollo Web", tags: ["TypeScript", "JavaScript", "Static Typing"] },
  ],
  products: [
    { id: "prod-1", name: "Ratón Inalámbrico", price: 25.99, stock: 150, category: "Electrónica", imageUrl: "https://placehold.co/600x400.png" },
    { id: "prod-2", name: "Teclado Mecánico", price: 89.99, stock: 75, category: "Electrónica", imageUrl: "https://placehold.co/600x400.png" },
    { id: "prod-3", name: "Taza de Café", price: 12.50, stock: 300, category: "Cocina", imageUrl: "https://placehold.co/600x400.png" },
  ],
  orders: [
    { id: "order-1", customerId: "user-2", amount: 115.98, status: "Enviado", date: new Date("2024-05-18") },
    { id: "order-2", customerId: "user-3", amount: 12.50, status: "Procesando", date: new Date("2024-05-20") },
    { id: "order-3", customerId: "user-2", amount: 25.99, status: "Entregado", date: new Date("2024-05-15") },
  ],
};

export const mockSchemas: { [key: string]: { definition: string; icon: string | null } } = {
    users: {
        definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  id: z.string(),\n  email: z.string().email(),\n  name: z.string(),\n  role: z.string(),\n  createdAt: z.string(),\n});`,
        icon: 'Users'
    },
    posts: {
        definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  id: z.string(),\n  title: z.string(),\n  status: z.string(),\n  authorId: z.string(),\n  publishedAt: z.date().nullable(),\n  content: z.string().optional(),\n  coverImageUrl: z.string().url().optional(),\n  category: z.string().optional(),\n  tags: z.array(z.string()).optional(),\n});`,
        icon: 'FileText'
    },
    products: {
        definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  id: z.string(),\n  name: z.string(),\n  price: z.number(),\n  stock: z.number(),\n  category: z.string(),\n});`,
        icon: 'Package'
    },
    orders: {
        definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  id: z.string(),\n  customerId: z.string(),\n  amount: z.number(),\n  status: z.string(),\n  date: z.string(),\n});`,
        icon: 'ShoppingCart'
    }
};


export function getCollectionData(collectionId: string) {
    return mockData[collectionId] || [];
}

export async function getCollectionDocuments(collectionId: string) {
  if (!isFirebaseLive()) {
      console.warn(`Firebase no está en modo real. Devolviendo datos de ejemplo para la colección: ${collectionId}`);
      return mockData[collectionId] || [];
  }

  try {
      const collectionRef = firestoreAdmin!.collection(collectionId);
      const snapshot = await collectionRef.get();
      if (snapshot.empty) {
          return [];
      }
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
      console.error(`Error al obtener documentos para la colección "${collectionId}":`, error);
      return mockData[collectionId] || [];
  }
}

export async function getCollectionSchema(collectionId: string): Promise<{ definition: string; icon: string | null }> {
    if (!isFirebaseLive()) {
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
      console.error(`Error al obtener el esquema de la colección para "${collectionId}":`, error);
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
    if (!isFirebaseLive()) {
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
        console.error("Error al obtener datos públicos de Firebase:", error);
        return {
            products: [],
            posts: [],
            galleryImages: []
        };
    }
}
