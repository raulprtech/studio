
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
  projects: [
    { id: "plataforma-ecommerce", title: "Plataforma de E-Commerce", description: "Una solución de e-commerce full-stack con un CMS personalizado.", tags: ["Next.js", "Firebase", "Stripe"], coverImageUrl: "https://placehold.co/600x400.png", hint: "website screenshot", longDescription: "Este proyecto es una plataforma de comercio electrónico completa construida con Next.js en el frontend y Firebase para el backend y la autenticación. La integración de Stripe permite un procesamiento de pagos seguro y eficiente. El panel de administración personalizado permite una gestión de productos e inventario sencilla.", gallery: ["https://placehold.co/800x600.png", "https://placehold.co/800x600.png", "https://placehold.co/800x600.png"], liveUrl: "#", githubUrl: "https://github.com/usuario/repo" },
    { id: "app-gestion-ia", title: "App de Gestión de IA", description: "Una aplicación para gestionar y monitorizar modelos de IA.", tags: ["React", "Python", "FastAPI"], coverImageUrl: "https://placehold.co/600x400.png", hint: "dashboard ui", longDescription: "Esta aplicación proporciona una interfaz para monitorizar el rendimiento y el uso de varios modelos de inteligencia artificial. El backend está construido con Python y FastAPI, ofreciendo una API de alta velocidad para la recolección de datos, mientras que el frontend de React permite una visualización de datos dinámica e interactiva.", gallery: ["https://placehold.co/800x600.png", "https://placehold.co/800x600.png"], liveUrl: "#", githubUrl: "https://github.com/usuario/repo" },
    { id: "admin-saas", title: "Panel de Admin SaaS", description: "Un panel de control completo para un producto SaaS.", tags: ["Next.js", "Tailwind", "Charts"], coverImageUrl: "https://placehold.co/600x400.png", hint: "admin dashboard", longDescription: "Un panel de administración robusto para una aplicación SaaS, con visualizaciones de datos, gestión de usuarios y ajustes de configuración. Construido priorizando una experiencia de usuario limpia y un código mantenible.", gallery: ["https://placehold.co/800x600.png", "https://placehold.co/800x600.png", "https://placehold.co/800x600.png"], liveUrl: "#", githubUrl: "https://github.com/usuario/repo" },
    { id: "billetera-movil", title: "Billetera Móvil", description: "Una billetera móvil multiplataforma para activos digitales.", tags: ["React Native", "Node.js", "Seguridad"], coverImageUrl: "https://placehold.co/600x400.png", hint: "mobile app", longDescription: "Una aplicación móvil segura y fácil de usar para gestionar criptomonedas y otros activos digitales. Incluye características como transacciones seguras, seguimiento de portafolio en tiempo real y autenticación biométrica.", gallery: ["https://placehold.co/800x600.png"], liveUrl: "#", githubUrl: "https://github.com/usuario/repo" },
    { id: "panel-ciberseguridad", title: "Panel de Ciberseguridad", description: "Panel de monitorización de amenazas de ciberseguridad en tiempo real.", tags: ["Data Viz", "Websockets", "React"], coverImageUrl: "https://placehold.co/600x400.png", hint: "cybersecurity dashboard", longDescription: "Un panel avanzado que visualiza amenazas de ciberseguridad en tiempo real. Utiliza Websockets para actualizaciones de datos en vivo y D3.js para visualizaciones de datos complejas e interactivas.", gallery: ["https://placehold.co/800x600.png", "https://placehold.co/800x600.png"], liveUrl: "#", githubUrl: "https://github.com/usuario/repo" },
    { id: "sitio-portafolio", title: "Sitio Web de Portafolio", description: "Un portafolio personal para mostrar mi trabajo y habilidades.", tags: ["Astro", "TailwindCSS", "Animaciones"], coverImageUrl: "https://placehold.co/600x400.png", hint: "portfolio website", longDescription: "El propio sitio que estás viendo ahora. Un portafolio moderno y rápido construido con Astro y TailwindCSS, con un enfoque en animaciones suaves y un diseño limpio para mostrar mi trabajo de la mejor manera.", gallery: [], liveUrl: "#", githubUrl: "https://github.com/usuario/repo" },
  ],
  storage: [
    { name: "product-image-1.jpg", type: "image/jpeg", size: "1.2 MB", date: "2024-05-20", url: "https://placehold.co/400x300.png", hint: "product photo" },
    { name: "company-logo.svg", type: "image/svg+xml", size: "15 KB", date: "2024-05-18", url: "https://placehold.co/400x300.png", hint: "company logo" },
    { name: "terms-of-service.pdf", type: "application/pdf", size: "256 KB", date: "2024-05-15", url: "https://placehold.co/400x300.png", hint: "document icon" },
    { name: "user-guide-video.mp4", type: "video/mp4", size: "25 MB", date: "2024-05-12", url: "https://placehold.co/400x300.png", hint: "video play" },
    { name: "background-music.mp3", type: "audio/mpeg", size: "3.5 MB", date: "2024-05-10", url: "https://placehold.co/400x300.png", hint: "audio waveform" },
    { name: "product-image-2.jpg", type: "image/jpeg", size: "980 KB", date: "2024-05-21", url: "https://placehold.co/400x300.png", hint: "product photo" },
    { name: "marketing-banner.png", type: "image/png", size: "2.1 MB", date: "2024-05-19", url: "https://placehold.co/400x300.png", hint: "marketing banner" },
    { name: "annual-report.docx", type: "application/msword", size: "5.4 MB", date: "2024-04-30", url: "https://placehold.co/400x300.png", hint: "document icon" },
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
    },
    projects: {
        definition: `import { z } from 'zod';\n\nexport const schema = z.object({\n  id: z.string(),\n  title: z.string(),\n  description: z.string().optional(),\n  longDescription: z.string().optional(),\n  coverImageUrl: z.string().url().optional(),\n  tags: z.array(z.string()).optional(),\n  liveUrl: z.string().url().optional(),\n  githubUrl: z.string().url().optional(),\n  gallery: z.array(z.string().url()).optional(),\n  hint: z.string().optional(),\n});`,
        icon: 'Briefcase'
    }
};


export function getCollectionData(collectionId: string) {
    return mockData[collectionId] || [];
}
