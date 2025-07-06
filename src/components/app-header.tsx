"use client";
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, Loader2 } from 'lucide-react';
import { SidebarTrigger } from './ui/sidebar';
import { ModeToggle } from './mode-toggle';
import { type AuthenticatedUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

function toTitleCase(str: string) {
  return str.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function LogoutButton() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await fetch('/api/auth/session', { method: 'DELETE' });
            if (response.ok) {
                router.push('/login');
                toast({ title: "Sesión cerrada", description: "Has cerrado sesión con éxito." });
            } else {
                 throw new Error("No se pudo cerrar la sesión.");
            }
        } catch (error) {
            toast({ title: "Error", description: String(error), variant: "destructive" });
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleLogout(); }} disabled={isLoggingOut}>
            {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            <span>Cerrar Sesión</span>
        </DropdownMenuItem>
    )
}

export function AppHeader({ user }: { user: AuthenticatedUser }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbNameMap: { [key: string]: string } = {
    dashboard: 'Panel',
    collections: 'Colecciones',
    authentication: 'Autenticación',
    storage: 'Almacenamiento',
    settings: 'Configuración',
    new: 'Nuevo',
    edit: 'Editar',
  };

  const getBreadcrumbName = (segment: string) => {
    return breadcrumbNameMap[segment] || toTitleCase(segment);
  }

  const getAvatarFallback = (name: string | null) => {
      if (!name) return 'U';
      const parts = name.split(' ');
      if (parts.length > 1) {
          return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Panel</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((segment, index) => {
             if (segment === "dashboard") return null;
            const href = `/${segments.slice(0, index + 1).join('/')}`;
            const isLast = index === segments.length - 1;
            const displayName = getBreadcrumbName(segment);
            return (
              <React.Fragment key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{displayName}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{displayName}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex items-center gap-2 md:grow-0">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
              <Avatar>
                <AvatarImage src={user.avatar || undefined} alt={user.name || "Usuario"} />
                <AvatarFallback>{getAvatarFallback(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <LogoutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
