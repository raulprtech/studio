import { firestoreAdmin, isFirebaseAdminInitialized } from './firebase-admin';

export const mockData: { [key: string]: any[] } = {
  users: [
    { id: "user-1", email: "alice@example.com", name: "Alice Johnson", role: "Admin", createdAt: "2024-01-15" },
    { id: "user-2", email: "bob@example.com", name: "Bob Williams", role: "Editor", createdAt: "2024-02-20" },
    { id: "user-3", email: "charlie@example.com", name: "Charlie Brown", role: "Viewer", createdAt: "2024-03-10" },
  ],
  posts: [
    { id: "post-1", title: "Getting Started with Next.js", status: "Published", authorId: "user-1", publishedAt: "2024-05-10" },
    { id: "post-2", title: "Advanced Tailwind CSS", status: "Draft", authorId: "user-2", publishedAt: null },
    { id: "post-3", title: "Firebase Authentication Deep Dive", status: "Published", authorId: "user-1", publishedAt: "2024-04-22" },
  ],
  products: [
    { id: "prod-1", name: "Wireless Mouse", price: 25.99, stock: 150, category: "Electronics" },
    { id: "prod-2", name: "Mechanical Keyboard", price: 89.99, stock: 75, category: "Electronics" },
    { id: "prod-3", name: "Coffee Mug", price: 12.50, stock: 300, category: "Kitchenware" },
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
              if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/) || !isNaN(Date.parse(value))) return 'z.string().datetime()';
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
