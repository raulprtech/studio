
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground antialiased selection:bg-primary/40">
      <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full">
        <div className="absolute -top-40 right-0 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[150px]"></div>
        <div className="absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[150px]"></div>
      </div>
      <PublicHeader />
      <main className="container mx-auto px-4 pt-32 min-h-screen">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
