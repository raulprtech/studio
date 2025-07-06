import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Twitter, Linkedin, Dribbble, ArrowRight, Mail, Phone, MapPin, Download, Send } from "lucide-react";

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

export default function PortfolioPage() {
  const skills = [
    { name: "JavaScript", level: 90 }, { name: "TypeScript", level: 85 },
    { name: "React / Next.js", level: 95 }, { name: "Node.js", level: 80 },
    { name: "Python", level: 70 }, { name: "SQL / NoSQL", level: 85 },
    { name: "UI/UX Design", level: 75 }, { name: "Figma", level: 80 },
    { name: "DevOps (Docker, K8s)", level: 65 }, { name: "GraphQL", level: 70 },
    { name: "TailwindCSS", level: 95 }, { name: "Firebase", level: 90 },
  ];

  const projects = [
    { title: "E-Commerce Platform", description: "A full-stack e-commerce solution with a custom CMS.", tags: ["Next.js", "Firebase", "Stripe"], image: "https://placehold.co/600x400.png", hint: "website screenshot" },
    { title: "AI Management App", description: "An application to manage and monitor AI models.", tags: ["React", "Python", "FastAPI"], image: "https://placehold.co/600x400.png", hint: "dashboard ui" },
    { title: "SaaS Admin Dashboard", description: "A comprehensive dashboard for a SaaS product.", tags: ["Next.js", "Tailwind", "Charts"], image: "https://placehold.co/600x400.png", hint: "admin dashboard" },
    { title: "Mobile Wallet", description: "A cross-platform mobile wallet for digital assets.", tags: ["React Native", "Node.js", "Security"], image: "https://placehold.co/600x400.png", hint: "mobile app" },
    { title: "Cyber Dashboard", description: "Real-time cybersecurity threat monitoring dashboard.", tags: ["Data Viz", "Websockets", "React"], image: "https://placehold.co/600x400.png", hint: "cybersecurity dashboard" },
    { title: "Portfolio Website", description: "A personal portfolio to showcase my work and skills.", tags: ["Astro", "TailwindCSS", "Animations"], image: "https://placehold.co/600x400.png", hint: "portfolio website" },
  ];

  const experiences = [
    { role: "Senior Frontend Developer", company: "Tech Innovators Inc.", date: "2021 - Present", description: "Leading the development of a new client-facing platform using Next.js and TypeScript, focusing on performance and scalability." },
    { role: "Frontend Developer", company: "Creative Solutions", date: "2019 - 2021", description: "Developed and maintained several large-scale web applications for various clients, improving user experience and code quality." },
    { role: "Web Developer", company: "Digital Agency", date: "2017 - 2019", description: "Built responsive websites and e-commerce stores for small to medium-sized businesses using WordPress, Shopify, and custom code." },
    { role: "Intern", company: "Startup Hub", date: "2016 - 2017", description: "Assisted the development team in various tasks, including bug fixing, feature implementation, and learning the ropes of professional software development." },
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
      
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
        <div className="bg-background/70 backdrop-blur-md rounded-full p-2 flex items-center justify-between shadow-lg border border-border/20">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 pl-4 pr-2">
                    <span className="font-bold text-xl">
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Alex</span>Chen
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                    {["About", "Skills", "Projects", "Experience", "Contact"].map((item) => (
                    <Link key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-foreground transition-colors px-3 py-2 rounded-full">
                        {item}
                    </Link>
                    ))}
                </nav>
            </div>
            <div className="pr-2">
                <Button asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-full hover:shadow-lg hover:shadow-primary/40 transition-shadow">
                    <a href="#">Resume</a>
                </Button>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-32">
        {/* Hero Section */}
        <section id="hero" className="relative flex items-center min-h-[calc(100vh-8rem)] py-20">
          <div className="relative z-10 space-y-6">
            <span className="text-primary font-semibold">Full Stack Developer</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
              Hi, I'm <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Alex</span>
              <br />
              Chen
            </h1>
            <p className="max-w-lg text-muted-foreground">
              I'm a passionate developer creating modern and responsive web applications.
              I turn complex problems into simple, beautiful, and intuitive designs.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
                MY WORKS
              </Button>
              <Button size="lg" variant="outline">
                MY RESUME <Download className="ml-2 h-4 w-4" />
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
        <section id="about" className="py-24">
          <SectionTitle label="INTRODUCTION" title="About Me" />
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="w-full aspect-square bg-card rounded-2xl p-6">
              <Image
                src="https://placehold.co/600x600.png"
                width={600}
                height={600}
                alt="Alex Chen"
                className="rounded-lg object-cover w-full h-full"
                data-ai-hint="portrait man"
              />
            </div>
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                I'm a self-taught developer with a passion for building beautiful and functional websites. 
                I have a strong background in both frontend and backend development, and I'm always looking for new challenges to tackle. 
                I love learning new technologies and I'm a firm believer in the power of continuous learning.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-foreground">Name:</span> Alex Chen</div>
                <div><span className="font-semibold text-foreground">Email:</span> contact@alexchen.dev</div>
                <div><span className="font-semibold text-foreground">Location:</span> San Francisco, CA</div>
                <div><span className="font-semibold text-foreground">Availability:</span> Open to work</div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-24">
          <SectionTitle label="MY ABILITIES" title="My Skills" />
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
        <section id="projects" className="py-24">
          <SectionTitle label="MY PORTFOLIO" title="Featured Projects" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card key={project.title} className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 group">
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
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  <p className="text-muted-foreground text-sm flex-grow">{project.description}</p>
                   <div className="flex flex-wrap gap-2">
                      {project.tags.map(tag => (
                          <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent border-primary/50 hover:bg-primary/10 text-primary group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground group-hover:border-transparent transition-all">
                    View Project <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Work Experience Section */}
        <section id="experience" className="py-24">
          <SectionTitle label="CAREER PATH" title="Work Experience" />
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
        <section id="contact" className="py-24">
          <SectionTitle label="GET IN TOUCH" title="Contact Me" />
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center"><Mail className="w-6 h-6 text-primary" /></div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <a href="mailto:contact@alexchen.dev" className="font-semibold hover:text-primary">contact@alexchen.dev</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center"><Phone className="w-6 h-6 text-primary" /></div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <a href="tel:+11234567890" className="font-semibold hover:text-primary">+1 123 456 7890</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center"><MapPin className="w-6 h-6 text-primary" /></div>
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-semibold">San Francisco, CA</p>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold pt-8">Contact On</h3>
              <div className="flex items-center gap-4">
                {socialLinks.map((link, index) => (
                    <Link key={index} href={link.href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-lg bg-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <link.icon className="h-6 w-6" />
                    </Link>
                ))}
              </div>
            </div>
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50">
              <h3 className="text-2xl font-bold mb-6">Send Me a Message</h3>
              <form className="space-y-4">
                <Input type="text" placeholder="Your Name" className="bg-background/50 border-border/80 h-12"/>
                <Input type="email" placeholder="Your Email" className="bg-background/50 border-border/80 h-12"/>
                <Textarea placeholder="Your Message" rows={5} className="bg-background/50 border-border/80"/>
                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
                  Send Message <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50">
          <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2024 Alex Chen. All rights reserved.</p>
             <div className="flex items-center gap-4">
              {socialLinks.map((link, index) => (
                <Link key={index} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <link.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
      </footer>
    </div>
  );
}
