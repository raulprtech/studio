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
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

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
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/collections" asChild isActive={isActive('/collections')}>
                <Link href="/collections">
                  <Database />
                  Collections
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/authentication" asChild isActive={isActive('/authentication')}>
                <Link href="/authentication">
                  <Users />
                  Authentication
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/storage" asChild isActive={isActive('/storage')}>
                <Link href="/storage">
                  <Folder />
                  Storage
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/settings" asChild isActive={isActive('/settings')}>
                <Link href="/settings">
                  <Settings />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button asChild>
            <Link href="/collections/new">
              <PlusCircle className="mr-2 h-4 w-4" /> New Collection
            </Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
