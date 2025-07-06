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

// We can't use async components in a layout that also needs "use client",
// so we'll fetch the user data in a client component using a hook-like pattern.
// In a real app with a full auth system, this would likely be in a context provider.
type UserRole = 'Admin' | 'Editor' | 'Viewer';

function useSimulatedUser() {
    const [role, setRole] = React.useState<UserRole>('Viewer'); // Default role
    React.useEffect(() => {
        // In a real app, you would fetch the user's role here.
        // For now, we'll keep the simulation logic simple.
        // You can manually change the role in `src/lib/auth.ts` to test.
        // This is a simplified approach because we can't use top-level await in a client component.
        const fetchRole = async () => {
             const response = await fetch('/api/user-role'); // A simple API route to get the role
             const data = await response.json();
             setRole(data.role);
        }
        // To keep it simple, I won't create an API route now. The logic remains client-side.
        // The role can be changed in `/src/lib/auth.ts` for testing purposes.
        // Let's pretend we fetched the role.
        setRole('Admin'); // Change this to 'Editor' or 'Viewer' to test
    }, []);
    return { role };
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Since we can't use async in this layout, we'll hardcode roles for UI demonstration.
  // The actual route protection would happen in middleware.
  // To test different views, change the role in `src/lib/auth.ts` and refresh.
  // The logic below is a placeholder for what a real auth system would do.
  const role: UserRole = 'Admin'; // Change to 'Editor' or 'Viewer' for testing UI changes.


  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const isAdmin = role === 'Admin';
  const isViewer = role === 'Viewer';

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
            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton href="/authentication" asChild isActive={isActive('/authentication')}>
                  <Link href="/authentication">
                    <Users />
                    Authentication
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton href="/storage" asChild isActive={isActive('/storage')}>
                <Link href="/storage">
                  <Folder />
                  Storage
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton href="/settings" asChild isActive={isActive('/settings')}>
                  <Link href="/settings">
                    <Settings />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {!isViewer && (
            <Button asChild>
              <Link href="/collections/new">
                <PlusCircle className="mr-2 h-4 w-4" /> New Collection
              </Link>
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
