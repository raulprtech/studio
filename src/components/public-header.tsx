import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  const navItems = [
    { name: "Sobre mí", href: "/#sobre-mí" },
    { name: "Habilidades", href: "/#habilidades" },
    { name: "Proyectos", href: "/#proyectos" },
    { name: "Experiencia", href: "/#experiencia" },
    { name: "Blog", href: "/blog" },
    { name: "Contacto", href: "/#contacto" },
  ];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-screen-lg px-4">
      <div className="bg-background/70 backdrop-blur-md rounded-full p-2 flex items-center justify-between shadow-lg border border-border/20">
        <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 pl-2 pr-4">
            <span className="font-bold text-lg">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Raul</span>Pacheco
            </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="hover:text-foreground transition-colors px-3 py-1.5 rounded-full">
                {item.name}
                </Link>
            ))}
            </nav>
        </div>
        <div className="pr-1">
          <Button asChild size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-full hover:shadow-lg hover:shadow-primary/40 transition-shadow">
            <a href="#">CV</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
