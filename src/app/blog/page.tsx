
import Link from 'next/link';
import Image from 'next/image';
import { getCollectionDocuments } from '@/lib/mock-data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

export default async function BlogIndexPage() {
  const allPosts = await getCollectionDocuments('posts');
  const publishedPosts = allPosts.filter(post => post.status === 'Publicado');

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Mi Blog</h1>
        <p className="text-muted-foreground mt-2">Explorando el mundo del código, el diseño y la tecnología.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {publishedPosts.map((post) => (
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
    </div>
  );
}
