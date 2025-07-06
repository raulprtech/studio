import { firestoreAdmin, isFirebaseAdminInitialized, storageAdmin } from './firebase-admin';

export const mockData: { [key: string]: any[] } = {
  users: [
    { id: "user-1", email: "alice@example.com", name: "Alice Johnson", role: "Admin", createdAt: "2024-01-15", disabled: false },
    { id: "user-2", email: "bob@example.com", name: "Bob Williams", role: "Editor", createdAt: "2024-02-20", disabled: false },
    { id: "user-3", email: "charlie@example.com", name: "Charlie Brown", role: "Viewer", createdAt: "2024-03-10", disabled: true },
  ],
  posts: [
    { id: "post-1", title: "Getting Started with Next.js", status: "Published", authorId: "user-1", publishedAt: "2024-05-10", content: "A detailed guide on setting up a new Next.js project." },
    { id: "post-2", title: "Advanced Tailwind CSS", status: "Draft", authorId: "user-2", publishedAt: null, content: "Discover advanced techniques for styling with Tailwind CSS." },
    { id: "post-3", title: "Firebase Authentication Deep Dive", status: "Published", authorId: "user-1", publishedAt: "2024-04-22", content: "Learn how to implement secure authentication with Firebase." },
  ],
  products: [
    { id: "prod-1", name: "Wireless Mouse", price: 25.99, stock: 150, category: "Electronics", imageUrl: "https://placehold.co/600x400.png" },
    { id: "prod-2", name: "Mechanical Keyboard", price: 89.99, stock: 75, category: "Electronics", imageUrl: "https://placehold.co/600x400.png" },
    { id: "prod-3", name: "Coffee Mug", price: 12.50, stock: 300, category: "Kitchenware", imageUrl: "https://placehold.co/600x400.png" },
  ],
  orders: [
    { id: "order-1", customerId: "user-2", amount: 115.98, status: "Shipped", date: "2024-05-18" },
    { id: "order-2", customerId: "user-3", amount: 12.50, status: "Processing", date: "2024-05-20" },
    { id: "order-3", customerId: "user-2", amount: 25.99, status: "Delivered", date: "2024-05-15" },
  ],
};

const mockSchemas: { [key: string]: string } = {
    users: `import { z } from 'zod';\n\nexport const schema = z.object({\n  id: z.string(),\n  email: z.string().email(),\n  name: z.string(),\n  role: z.string(),\n  createdAt: z.string(),\n});`,
    posts: `import { z } from 'zod';\n\nexport const schema = z.object({\n  id: z.string(),\n  title: z.string(),\n  status: z.string(),\n  authorId: z.string(),\n  publishedAt: z.string().nullable(),\n});`,
    products: `import { z } from 'zod';\n\nexport const schema = z.object({\n  id: z.string(),\n  name: z.string(),\n  price: z.number(),\n  stock: z.number(),\n  category: z.string(),\n});`,
    orders: `import { z } from 'zod';\n\nexport const schema = z.object({\n  id: z.string(),\n  customerId: z.string(),\n  amount: z.number(),\n  status: z.string(),\n  date: z.string(),\n});`
};


export function getCollectionData(collectionId: string) {
    // This function still returns mock data. 
    // It can be replaced with a real Firestore query later.
    return mockData[collectionId] || [];
}

// This function now fetches a saved schema from Firestore.
// If not found, it falls back to inferring from the first document in the live collection.
export async function getCollectionSchema(collectionId: string): Promise<string> {
    if (!isFirebaseAdminInitialized || !firestoreAdmin) {
        console.warn(`Firebase not initialized. Returning mock schema for collection: ${collectionId}`);
        return mockSchemas[collectionId] || `import { z } from 'zod';\n\nexport const schema = z.object({\n  // Firebase is not configured. This is a default schema for '${collectionId}'.\n});`;
    }

    try {
      const schemaDoc = await firestoreAdmin.collection('_schemas').doc(collectionId).get();
  
      if (schemaDoc.exists && schemaDoc.data()?.definition) {
          return schemaDoc.data()?.definition;
      }
  
      // Fallback: Infer from the first document in the actual Firestore collection.
      const collectionRef = firestoreAdmin.collection(collectionId);
      const snapshot = await collectionRef.limit(1).get();
      
      if (snapshot.empty) {
          return "z.object({\n  // Collection is empty or does not exist. Cannot infer schema.\n});";
      }
  
      const firstItem = snapshot.docs[0].data();
      
      const getZodType = (value: any): string => {
          const type = typeof value;
          if (type === 'string') {
              if (/\S+@\S+\.\S+/.test(value)) return 'z.string().email({ message: "Invalid email address" })';
              if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(\.\d{3})?Z$/) || !isNaN(Date.parse(value))) return 'z.string().datetime()';
              return 'z.string()';
          }
          if (type === 'number') return 'z.number()';
          if (type === 'boolean') return 'z.boolean()';
          if (value === null) return 'z.any().nullable()';
          // Check for Firestore Timestamp
          if (value && typeof value.toDate === 'function') return 'z.date()';
          return 'z.any()';
      }
  
      const schemaFields = Object.entries(firstItem)
          .map(([key, value]) => `  ${key}: ${getZodType(value)}`)
          .join(',\n');
      
      return `import { z } from 'zod';\n\nexport const schema = z.object({\n${schemaFields}\n});`;
  
    } catch (error) {
      console.error(`Error fetching collection schema for "${collectionId}":`, error);
      return `import { z } from 'zod';\n\nexport const schema = z.object({\n  // An error occurred while fetching the schema.\n  // Check server logs and Firebase configuration for details.\n});`;
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
    const [files] = await bucket.getFiles({ maxResults: limit * 2 }); // Fetch more to filter
    
    const imageFiles = files.filter(file => file.metadata.contentType?.startsWith('image/')).slice(0, limit);

    const urls = await Promise.all(
        imageFiles.map(async (file) => {
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491' // Far future expiration
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
    if (!isFirebaseAdminInitialized) {
        console.warn("Firebase not initialized. Returning mock data for public page.");
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
        console.error("Error fetching public data from Firebase:", error);
        return {
            products: [],
            posts: [],
            galleryImages: []
        };
    }
}
