import * as React from 'react';
import { cookies } from 'next/headers';
import { isFirebaseConfigured } from '@/lib/firebase-admin';
import { ModeSwitch } from './dashboard/components/mode-switch';
import { AppLayoutClient } from './components/app-layout-client';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const mode = cookies().get('app-mode')?.value === 'live' ? 'live' : 'demo';
  const isConfigured = isFirebaseConfigured;

  const modeSwitchComponent = (
    <>
      <ModeSwitch initialMode={mode} isConfigured={isConfigured} />
      <p className="text-xs text-muted-foreground pt-2">
        {isConfigured ? "Toggle between live and demo data." : "Firebase not configured. Only demo mode is available."}
      </p>
    </>
  );

  return (
    <AppLayoutClient modeSwitch={modeSwitchComponent}>
      {children}
    </AppLayoutClient>
  );
}
