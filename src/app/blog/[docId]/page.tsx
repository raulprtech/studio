
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getDocumentAction } from '@/lib/actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type Metadata } from 'next';
import { ShareButtons } from '../components/share-buttons';

type Props = {
  params: { docId: string }
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { docId } = params;
  const { data: post } = await getDocumentAction('posts', docId);

  if (!post) {
    return {
      title: 'Post no encontrado'
    }
  }

  const description = post.content ? post.content.substring(0, 160) : 'Un artículo del blog de Raul Pacheco.';

  return {
    title: `${post.title} | Blog`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      images: [
        {
          url: post.coverImageUrl || 'https://placehold.co/1200x630.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { docId } = params;
  const { data: post, error } = await getDocumentAction('posts', docId);

  if (error || !post) {
    notFound();
  }

  // A simple author mapping for the demo. In a real app, you'd fetch this from the 'users' collection.
  const author = {
      name: "Raul Pacheco",
      avatar: "https://placehold.co/600x600.png"
  }

  return (
    <article className="py-12 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
             <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={author.avatar} alt={author.name} data-ai-hint="person portrait" />
                    <AvatarFallback>RP</AvatarFallback>
                </Avatar>
                <span>{author.name}</span>
            </div>
            <span>•</span>
             {post.publishedAt && (
                <time dateTime={new Date(post.publishedAt.toDate ? post.publishedAt.toDate() : post.publishedAt).toISOString()}>
                    {format(new Date(post.publishedAt.toDate ? post.publishedAt.toDate() : post.publishedAt), "d 'de' LLLL 'de' yyyy", { locale: es })}
                </time>
             )}
        </div>
      </header>

      {post.coverImageUrl && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <Image
            src={post.coverImageUrl}
            alt={`Portada de ${post.title}`}
            width={1200}
            height={630}
            className="w-full aspect-video object-cover"
            priority // Load cover image faster
            data-ai-hint="blog post cover"
          />
        </div>
      )}
      
      <div className="prose prose-lg dark:prose-invert max-w-none mx-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content || ''}
        </ReactMarkdown>
      </div>

      <ShareButtons title={post.title} />
    </article>
  );
}
