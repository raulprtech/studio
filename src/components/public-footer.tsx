
import Link from "next/link";
import { Github, Twitter, Linkedin, Dribbble } from "lucide-react";

export function PublicFooter() {
  const socialLinks = [
    { icon: Github, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Dribbble, href: "#" },
  ];

  return (
    <footer className="border-t border-border/50">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">&copy; 2024 Raul Pacheco. Todos los derechos reservados.</p>
           <div className="flex items-center gap-4">
            {socialLinks.map((link, index) => (
              <Link key={index} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <link.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
    </footer>
  );
}
