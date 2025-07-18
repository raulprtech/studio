

"use client";

import * as React from 'react';
import Link from 'next/link';
import {
  Home,
  Users,
  Database,
  Folder,
  Settings,
  Bug,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/app-header';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { usePinnedCollections } from '@/hooks/use-pinned-collections';
import { DynamicIcon } from '@/components/dynamic-icon';
import { type AuthenticatedUser } from '@/lib/auth';

type Collection = {
  name: string;
  icon?: string | null;
}

export function AppLayoutClient({ children, user, collections }: { children: React.ReactNode, user: AuthenticatedUser, collections: Collection[] }) {
  const pathname = usePathname();
  const { pinnedCollections, isClient } = usePinnedCollections();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const isAdmin = user.role === 'Admin';
  
  const pinned = isClient ? collections.filter(c => pinnedCollections.includes(c.name)) : [];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold">Admin Spark</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" asChild isActive={isActive('/dashboard')}>
                <Link href="/dashboard">
                  <Home />
                  <span>Panel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/collections" asChild isActive={isActive('/collections') && !pinned.some(p => pathname.includes(p.name))}>
                <Link href="/collections">
                  <Database />
                  <span>Colecciones</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {pinned.length > 0 && (
                <SidebarGroup className="p-0">
                    {pinned.map((collection) => (
                        <SidebarMenuItem key={collection.name}>
                            <SidebarMenuButton
                                href={`/collections/${collection.name}`}
                                asChild
                                isActive={isActive(`/collections/${collection.name}`)}
                                tooltip={collection.name}
                            >
                                <Link href={`/collections/${collection.name}`}>
                                    <DynamicIcon name={collection.icon} className="h-4 w-4" />
                                    <span>{collection.name}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarGroup>
            )}

            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton href="/authentication" asChild isActive={isActive('/authentication')}>
                  <Link href="/authentication">
                    <Users />
                    <span>Autenticación</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton href="/storage" asChild isActive={isActive('/storage')}>
                <Link href="/storage">
                  <Folder />
                  <span>Almacenamiento</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAdmin && (
               <SidebarGroup>
                <SidebarGroupLabel>Configuración</SidebarGroupLabel>
                <SidebarMenuItem>
                    <SidebarMenuButton href="/settings" asChild isActive={isActive('/settings')}>
                        <Link href="/settings">
                        <Settings />
                        <span>General</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton href="/debug" asChild isActive={isActive('/debug')}>
                        <Link href="/debug">
                        <Bug />
                        <span>Depuración</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroup>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           {/* Footer can be used for other things later */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader user={user} />
        <main className="flex-1 p-4 sm:px-6 sm:py-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
