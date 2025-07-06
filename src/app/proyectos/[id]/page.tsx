
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = mockData.projects.find(p => p.id === params.id);

  if (!project) {
    return {
      title: 'Proyecto no encontrado'
    }
  }

  return {
    title: `${project.title} | Proyectos`,
    description: project.description,
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = mockData.projects.find(p => p.id === params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="py-12 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-2">{project.title}</h1>
        <p className="text-lg text-muted-foreground">{project.description}</p>
      </header>

      <div className="mb-8 overflow-hidden rounded-lg shadow-lg">
        <Image
          src={project.image}
          alt={`Imagen principal de ${project.title}`}
          width={1200}
          height={675}
          className="w-full aspect-video object-cover"
          priority
          data-ai-hint={project.hint}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 prose prose-lg dark:prose-invert max-w-none">
          <h2>Sobre el Proyecto</h2>
          <p>{project.longDescription}</p>
        </div>
        <aside className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-lg bg-card/80 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Tecnologías Utilizadas</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <span key={tag} className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
          {project.liveUrl && (
            <Button asChild className="w-full" size="lg">
              <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                Ver Proyecto en Vivo <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </aside>
      </div>

      {project.gallery && project.gallery.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center mb-8">Galería del Proyecto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.gallery.map((imgUrl, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-md">
                <Image
                  src={imgUrl}
                  alt={`Imagen de galería ${index + 1} para ${project.title}`}
                  width={800}
                  height={600}
                  className="w-full aspect-[4/3] object-cover"
                  data-ai-hint="project screenshot"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
