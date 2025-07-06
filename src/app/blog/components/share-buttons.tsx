
"use client";

import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Twitter, Linkedin, Copy } from "lucide-react";
import { Icons } from "@/components/icons";

export function ShareButtons({ title }: { title: string }) {
    const { toast } = useToast();
    const pathname = usePathname();
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        // Ensure this runs only on the client where window is available
        setCurrentUrl(window.location.href);
    }, [pathname]);


    if (!currentUrl) {
        // You can return a loader or null until the URL is available
        return null;
    }

    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(title);

    const socialLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentUrl).then(() => {
            toast({
                title: "Enlace Copiado",
                description: "El enlace del post ha sido copiado a tu portapapeles.",
            });
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            toast({
                title: "Error",
                description: "No se pudo copiar el enlace.",
                variant: "destructive"
            });
        });
    };

    return (
        <div className="mt-12 pt-8 border-t border-border/50">
            <h3 className="text-lg font-semibold mb-4 text-center">¡Comparte este artículo!</h3>
            <div className="flex justify-center items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Twitter">
                        <Twitter />
                    </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                     <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Facebook">
                        <Icons.Facebook />
                    </a>
                </Button>
                 <Button variant="outline" size="icon" asChild>
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Compartir en LinkedIn">
                        <Linkedin />
                    </a>
                </Button>
                <Button variant="outline" size="icon" onClick={handleCopyLink} aria-label="Copiar enlace">
                    <Copy />
                </Button>
            </div>
        </div>
    );
}
