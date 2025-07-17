

import Link from 'next/link';
import Image from 'next/image';
import { getCollectionDocuments } from '@/lib/data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search } from 'lucide-react';

export const metadata = {
  title: 'Blog | Raul Pacheco',
  description: 'Artículos sobre desarrollo web, tecnología y diseño.',
};

function getExcerpt(markdownText: string, length = 150) {
  if (!markdownText) return '';
  const plainText = markdownText
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/[*_`~>]+/g, '') // Remove markdown symbols
    .replace(/\s\s+/g, ' '); // Normalize spaces
  
  if (plainText.length <= length) {
    return plainText;
  }
  return plainText.substring(0, length).trim() + '...';
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    category?: string;
    page?: string;
  };
}) {
  const allPosts = await getCollectionDocuments('posts');
  let publishedPosts: any[] = allPosts.filter((post: any) => post.status === 'Publicado');

  const query = searchParams?.q || '';
  const category = searchParams?.category || '';
  const currentPage = Number(searchParams?.page) || 1;
  const postsPerPage = 9;

  // Filtering logic
  if (query) {
    const lowerCaseQuery = query.toLowerCase();
    publishedPosts = publishedPosts.filter(post => 
      post.title.toLowerCase().includes(lowerCaseQuery) ||
      post.content?.toLowerCase().includes(lowerCaseQuery) ||
      post.tags?.some((tag: string) => tag.toLowerCase().includes(lowerCaseQuery))
    );
  }

  if (category) {
    publishedPosts = publishedPosts.filter(post => post.category === category);
  }
  
  const uniqueCategories = [...new Set(allPosts.filter((p: any) => p.status === 'Publicado' && p.category).map((p: any) => p.category))];

  // Pagination logic
  const totalPosts = publishedPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const paginatedPosts = publishedPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams();
    if (query) {
      params.set('q', query);
    }
    if (category) {
      params.set('category', category);
    }
    params.set('page', pageNumber.toString());
    return `/blog?${params.toString()}`;
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Mi Blog</h1>
        <p className="text-muted-foreground mt-2">Explorando el mundo del código, el diseño y la tecnología.</p>
      </div>

      <div className="mb-12 max-w-2xl mx-auto">
        <form className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full shadow-md p-1 pr-2">
          <Input
            name="q"
            type="search"
            placeholder="Buscar por título, etiqueta..."
            defaultValue={query}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 h-11 pl-5"
          />
          
          <div className="h-6 w-px bg-border"></div>

          <select
            name="category"
            defaultValue={category}
            className="bg-transparent border-none focus:outline-none text-sm text-muted-foreground hover:text-foreground pr-2 pl-4 appearance-none"
          >
            <option value="">Todas las categorías</option>
            {uniqueCategories.map((cat, index) => <option key={index} value={cat}>{cat}</option>)}
          </select>
          
          <Button type="submit" size="icon" className="rounded-full w-10 h-10 shrink-0">
              <Search className="h-4 w-4" />
          </Button>
        </form>
        {/* Add a way to clear filters if they are active */}
        {(query || category) && (
          <div className="text-center mt-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog">Limpiar filtros</Link>
            </Button>
          </div>
        )}
      </div>


      {paginatedPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedPosts.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id} className="group">
              <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0">
                  <div className="overflow-hidden">
                    <Image
                      src={post.coverImageUrl || "https://placehold.co/600x400.png"}
                      alt={post.title}
                      width={600}
                      height={400}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint="blog post cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex flex-col flex-grow">
                  {post.category && <p className="text-primary text-sm font-medium mb-2">{post.category}</p>}
                  <h2 className="text-xl font-bold group-hover:text-primary transition-colors">{post.title}</h2>
                  <p className="text-muted-foreground text-sm flex-grow my-3">{getExcerpt(post.content || '')}</p>
                  {post.publishedAt && (
                    <time dateTime={new Date(post.publishedAt.toDate ? post.publishedAt.toDate() : post.publishedAt).toISOString()} className="text-sm text-muted-foreground mt-auto">
                      {format(new Date(post.publishedAt.toDate ? post.publishedAt.toDate() : post.publishedAt), "d 'de' LLLL 'de' yyyy", { locale: es })}
                    </time>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
            <h3 className="text-2xl font-bold">No se encontraron posts</h3>
            <p className="mt-2">Intenta ajustar tus filtros o revisa más tarde.</p>
             <Button asChild className="mt-4">
                <Link href="/blog">Limpiar Filtros</Link>
             </Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={createPageURL(currentPage - 1)} />
                </PaginationItem>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink href={createPageURL(page)} isActive={currentPage === page}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext href={createPageURL(currentPage + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
