"use client";

import * as React from 'react';
import Link from 'next/link';
import {
  Home,
  Users,
  Database,
  Folder,
  Settings,
  PlusCircle,
  TestTube2,
  Bookmark,
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
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePinnedCollections } from '@/hooks/use-pinned-collections';
import { DynamicIcon } from '@/components/dynamic-icon';

type UserRole = 'Admin' | 'Editor' | 'Viewer';

type Collection = {
  name: string;
  icon?: string | null;
}

export function AppLayoutClient({ children, modeSwitch, collections }: { children: React.ReactNode, modeSwitch: React.ReactNode, collections: Collection[] }) {
  const pathname = usePathname();
  const role: UserRole = 'Admin';
  const { pinnedCollections, isClient } = usePinnedCollections();


  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const isAdmin = role === 'Admin';
  
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
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/collections" asChild isActive={isActive('/collections') && !pinned.some(p => pathname.includes(p.name))}>
                <Link href="/collections">
                  <Database />
                  <span>Collections</span>
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
                    <span>Authentication</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton href="/storage" asChild isActive={isActive('/storage')}>
                <Link href="/storage">
                  <Folder />
                  <span>Storage</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton href="/settings" asChild isActive={isActive('/settings')}>
                  <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <div className="border-t border-sidebar-border -mx-2 mb-2 pt-2 px-2">
                <Card className="shadow-none border-none bg-transparent p-0">
                    <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Application Mode</CardTitle>
                        <TestTube2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {modeSwitch}
                    </CardContent>
                </Card>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
