
import Link from 'next/link';
import Image from 'next/image';
import { mockData } from '@/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Proyectos | Raul Pacheco',
  description: 'Una selección de proyectos en los que he trabajado.',
};

export default async function ProjectsPage() {
  const projects = mockData.projects;

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Mis Proyectos</h1>
        <p className="text-muted-foreground mt-2">Un vistazo a algunos de los proyectos que he construido.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 group flex flex-col">
            <CardHeader className="p-0">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={600}
                  height={400}
                  className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={project.hint}
                />
            </CardHeader>
            <CardContent className="p-6 space-y-4 flex-grow">
              <h3 className="text-xl font-bold">{project.title}</h3>
              <p className="text-muted-foreground text-sm">{project.description}</p>
               <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                      <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline" className="w-full bg-transparent border-primary/50 hover:bg-primary/10 text-primary group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground group-hover:border-transparent transition-all">
                    <Link href={`/proyectos/${project.id}`}>
                        Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
