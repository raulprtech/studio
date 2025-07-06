
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
}

export function getCollectionData(collectionId: string) {
    return mockData[collectionId] || [];
}
