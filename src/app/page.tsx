import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPublicData } from "@/lib/mock-data";
import { Logo } from "@/components/logo";
import { ArrowRight } from "lucide-react";

export default async function PublicPage() {
  const { products, posts, galleryImages } = await fetchPublicData();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Logo />
          <span className="font-semibold text-lg">Admin Spark</span>
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#products">
            Productos
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#posts">
            Blog
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#gallery">
            Galería
          </Link>
        </nav>
        <div className="ml-auto md:ml-4">
            <Button asChild>
                <Link href="/dashboard">Panel de Admin</Link>
            </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/40">
            <div className="container px-4 md:px-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                El Headless CMS Definitivo para tus Proyectos
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                Gestiona tu contenido con facilidad y potencia tu frontend. Construido con Next.js, Firebase y Google AI.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Button size="lg" asChild>
                                <Link href="/dashboard">
                                    Empezar ahora
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <Image
                        src="https://placehold.co/600x500.png"
                        width="600"
                        height="500"
                        alt="Hero"
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:aspect-square"
                        data-ai-hint="abstract geometric"
                    />
                </div>
            </div>
        </section>
        
        {products && products.length > 0 && (
          <section id="products" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Productos Destacados</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Explora nuestra selección de productos directamente desde nuestra colección de Firestore.
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product: any) => (
                        <Card key={product.id}>
                            <CardHeader>
                                <Image
                                    src={product.imageUrl || "https://placehold.co/600x400.png"}
                                    alt={product.name}
                                    width={600}
                                    height={400}
                                    className="rounded-t-lg object-cover aspect-[3/2]"
                                    data-ai-hint="product photo"
                                />
                            </CardHeader>
                            <CardContent>
                                <CardTitle>{product.name}</CardTitle>
                                <p className="text-lg font-semibold text-primary">${Number(product.price).toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground">{product.category}</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full">Añadir al carrito</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
          </section>
        )}

        {posts && posts.length > 0 && (
           <section id="posts" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Últimas Publicaciones</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Lee nuestro contenido más reciente, gestionado desde nuestro panel de administración.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                    {posts.map((post: any) => (
                        <Card key={post.id} className="flex flex-col">
                           <CardHeader>
                             <CardTitle>{post.title}</CardTitle>
                             <CardDescription>Publicado el {new Date(post.publishedAt).toLocaleDateString()}</CardDescription>
                           </CardHeader>
                           <CardContent className="flex-grow">
                                <p className="text-muted-foreground line-clamp-3">{post.content}</p>
                           </CardContent>
                           <CardFooter>
                                <Button variant="link" className="p-0 h-auto">
                                    Leer más
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                           </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
           </section>
        )}

        {galleryImages && galleryImages.length > 0 && (
          <section id="gallery" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Desde Nuestro Almacenamiento</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Imágenes directamente desde nuestro bucket de Firebase Storage.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages.map((image: any) => (
                        <div key={image.name} className="overflow-hidden rounded-lg">
                            <Image
                                src={image.url}
                                alt={image.name}
                                width={400}
                                height={400}
                                className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
                                data-ai-hint={image.hint}
                            />
                        </div>
                    ))}
                </div>
            </div>
          </section>
        )}
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Admin Spark. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Términos de Servicio
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
