

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Twitter, Linkedin, Dribbble, ArrowRight, Mail, Phone, MapPin, Download, Send } from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { getCollectionDocuments } from "@/lib/data";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Helper component for section titles
const SectionTitle = ({ label, title }: { label: string; title: string }) => (
  <div className="flex flex-col items-center text-center gap-2 mb-12">
    <span className="text-sm font-medium text-primary border border-primary/50 rounded-full px-3 py-1">{label}</span>
    <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
  </div>
);

// Dot pattern component for the hero section
const GridPattern = () => (
    <div className="hidden md:block absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 lg:w-96 lg:h-96" aria-hidden="true">
        <div className="grid grid-cols-10 grid-rows-10 w-full h-full gap-4">
            {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-accent/80' : 'bg-primary/60' } animate-pulse`} style={{ animationDelay: `${i * 10}ms`, animationDuration: '3s' }}></div>
            ))}
        </div>
    </div>
)

// Helper function to get an excerpt from markdown
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

export default async function PortfolioPage() {
  const skills = [
    { name: "JavaScript", level: 90 }, { name: "TypeScript", level: 85 },
    { name: "React / Next.js", level: 95 }, { name: "Node.js", level: 80 },
    { name: "Python", level: 70 }, { name: "SQL / NoSQL", level: 85 },
    { name: "Diseño UI/UX", level: 75 }, { name: "Figma", level: 80 },
    { name: "DevOps (Docker, K8s)", level: 65 }, { name: "GraphQL", level: 70 },
    { name: "TailwindCSS", level: 95 }, { name: "Firebase", level: 90 },
  ];

  const allProjects = await getCollectionDocuments('projects');
  const projects = allProjects.slice(0, 3);
  
  const allPosts = await getCollectionDocuments('posts');
  const posts = allPosts
    .filter((p: any) => p.status === 'Publicado' && p.publishedAt)
    .sort((a: any, b: any) => new Date(b.publishedAt?.toDate ? b.publishedAt.toDate() : b.publishedAt).getTime() - new Date(a.publishedAt?.toDate ? a.publishedAt.toDate() : a.publishedAt).getTime())
    .slice(0, 3);

  const experiences = [
    { role: "Desarrollador Frontend Senior", company: "Tech Innovators Inc.", date: "2021 - Presente", description: "Liderando el desarrollo de una nueva plataforma para clientes usando Next.js y TypeScript, con foco en rendimiento y escalabilidad." },
    { role: "Desarrollador Frontend", company: "Creative Solutions", date: "2019 - 2021", description: "Desarrollé y mantuve varias aplicaciones web a gran escala para diversos clientes, mejorando la experiencia de usuario y la calidad del código." },
    { role: "Desarrollador Web", company: "Digital Agency", date: "2017 - 2019", description: "Construí sitios web responsive y tiendas de e-commerce para pequeñas y medianas empresas usando WordPress, Shopify y código personalizado." },
    { role: "Pasante", company: "Startup Hub", date: "2016 - 2017", description: "Asistí al equipo de desarrollo en diversas tareas, incluyendo corrección de errores, implementación de características y aprendiendo los fundamentos del desarrollo de software profesional." },
  ];

  const socialLinks = [
    { icon: Github, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Dribbble, href: "#" },
  ];

  return (
    <div className="bg-background text-foreground antialiased selection:bg-primary/40">
      <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full">
        <div className="absolute -top-40 right-0 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[150px]"></div>
        <div className="absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[150px]"></div>
      </div>
      
      <PublicHeader />

      <main className="container mx-auto px-4 pt-32">
        {/* Hero Section */}
        <section id="hero" className="relative flex items-center min-h-[calc(100vh-8rem)] py-20">
          <div className="relative z-10 space-y-6">
            <span className="text-primary font-semibold">Desarrollador Full Stack</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
              Hola, soy <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Raul</span>
              <br />
              Pacheco
            </h1>
            <p className="max-w-lg text-muted-foreground">
              Soy un desarrollador apasionado creando aplicaciones web modernas y responsivas.
              Convierto problemas complejos en diseños simples, hermosos e intuitivos.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
                MIS TRABAJOS
              </Button>
              <Button size="lg" variant="outline">
                MI CV <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-4">
              {socialLinks.map((link, index) => (
                <Link key={index} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <link.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>
          <GridPattern />
        </section>

        {/* About Me Section */}
        <section id="sobre-mí" className="py-24">
          <SectionTitle label="INTRODUCCIÓN" title="Sobre Mí" />
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="w-full aspect-square bg-card rounded-2xl p-6">
              <Image
                src="https://placehold.co/600x600.png"
                width={600}
                height={600}
                alt="Raul Pacheco"
                className="rounded-lg object-cover w-full h-full"
                data-ai-hint="portrait man"
              />
            </div>
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Soy un desarrollador autodidacta con una pasión por construir sitios web hermosos y funcionales. 
                Tengo una sólida experiencia tanto en desarrollo frontend como backend, y siempre estoy buscando nuevos desafíos que abordar. 
                Me encanta aprender nuevas tecnologías y creo firmemente en el poder del aprendizaje continuo.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-foreground">Nombre:</span> Raul Pacheco</div>
                <div><span className="font-semibold text-foreground">Email:</span> contact@raulpacheco.dev</div>
                <div><span className="font-semibold text-foreground">Ubicación:</span> San Francisco, CA</div>
                <div><span className="font-semibold text-foreground">Disponibilidad:</span> Abierto a trabajar</div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="habilidades" className="py-24">
          <SectionTitle label="MIS CAPACIDADES" title="Mis Habilidades" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {skills.map((skill) => (
              <Card key={skill.name} className="p-6 bg-card/80 backdrop-blur-sm border-border/50">
                <h3 className="font-semibold mb-2">{skill.name}</h3>
                <Progress value={skill.level} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
              </Card>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section id="proyectos" className="py-24">
          <SectionTitle label="MI PORTAFOLIO" title="Proyectos Destacados" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project: any) => (
              <Card key={project.id} className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 group flex flex-col">
                <CardHeader className="p-0">
                    <Image
                      src={project.coverImageUrl || "https://placehold.co/600x400.png"}
                      alt={project.title || 'Imagen del Proyecto'}
                      width={600}
                      height={400}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={project.hint || ''}
                    />
                </CardHeader>
                <CardContent className="p-6 space-y-4 flex-grow">
                  <h3 className="text-xl font-bold">{project.title || project.description || 'Proyecto sin título'}</h3>
                  <p className="text-muted-foreground text-sm">{project.description}</p>
                   <div className="flex flex-wrap gap-2">
                      {project.tags?.map((tag: string) => (
                          <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full bg-transparent border-primary/50 hover:bg-primary/10 text-primary group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground group-hover:border-transparent transition-all">
                        <Link href={`/proyectos/${project.id}`}>
                          Ver Proyecto <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/proyectos">
                Ver Más Proyectos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
        
        {/* Blog Section */}
        <section id="blog" className="py-24">
          <SectionTitle label="DESDE MI BLOG" title="Artículos Recientes" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Link href={`/blog/${post.id}`} key={post.id} className="group">
                <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="p-0">
                    <Image
                      src={post.coverImageUrl || "https://placehold.co/600x400.png"}
                      alt={post.title}
                      width={600}
                      height={400}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint="blog post cover"
                    />
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    {post.category && <p className="text-primary text-sm font-medium mb-2">{post.category}</p>}
                    <h2 className="text-xl font-bold group-hover:text-primary transition-colors">{post.title}</h2>
                    <p className="text-muted-foreground text-sm flex-grow my-3">{getExcerpt(post.content || '', 120)}</p>
                    {post.publishedAt && (
                    <time dateTime={new Date(post.publishedAt?.toDate ? post.publishedAt.toDate() : post.publishedAt).toISOString()} className="text-sm text-muted-foreground mt-auto">
                      {format(new Date(post.publishedAt?.toDate ? post.publishedAt.toDate() : post.publishedAt), "d 'de' LLLL 'de' yyyy", { locale: es })}
                    </time>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/blog">
                Ver Más Artículos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Work Experience Section */}
        <section id="experiencia" className="py-24">
          <SectionTitle label="TRAYECTORIA PROFESIONAL" title="Experiencia Laboral" />
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block"></div>
            {experiences.map((exp, index) => (
              <div key={exp.role} className={`relative flex items-center md:justify-center mb-12`}>
                <div className={`flex w-full md:w-1/2 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                  <div className={`w-full md:w-11/12 p-6 rounded-lg bg-card/80 backdrop-blur-sm border-border/50 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                    <p className="text-sm text-primary font-semibold mb-1">{exp.date}</p>
                    <h3 className="text-xl font-bold mb-2">{exp.role}</h3>
                    <p className="text-sm text-muted-foreground font-medium mb-3">{exp.company}</p>
                    <p className="text-sm text-muted-foreground">{exp.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 border-4 border-background hidden md:block"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contacto" className="py-24">
          <SectionTitle label="PONTE EN CONTACTO" title="Contáctame" />
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold">Información de Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center"><Mail className="w-6 h-6 text-primary" /></div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <a href="mailto:contact@raulpacheco.dev" className="font-semibold hover:text-primary">contact@raulpacheco.dev</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center"><Phone className="w-6 h-6 text-primary" /></div>
                  <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <a href="tel:+11234567890" className="font-semibold hover:text-primary">+1 123 456 7890</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center"><MapPin className="w-6 h-6 text-primary" /></div>
                  <div>
                    <p className="text-muted-foreground">Dirección</p>
                    <p className="font-semibold">San Francisco, CA</p>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold pt-8">Contacto en Redes</h3>
              <div className="flex items-center gap-4">
                {socialLinks.map((link, index) => (
                    <Link key={index} href={link.href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-lg bg-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <link.icon className="h-6 w-6" />
                    </Link>
                ))}
              </div>
            </div>
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50">
              <h3 className="text-2xl font-bold mb-6">Envíame un Mensaje</h3>
              <form className="space-y-4">
                <Input type="text" placeholder="Tu Nombre" className="bg-background/50 border-border/80 h-12"/>
                <Input type="email" placeholder="Tu Email" className="bg-background/50 border-border/80 h-12"/>
                <Textarea placeholder="Tu Mensaje" rows={5} className="bg-background/50 border-border/80"/>
                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
                  Enviar Mensaje <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
