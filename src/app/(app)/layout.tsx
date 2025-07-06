import * as React from 'react';
import { cookies } from 'next/headers';
import { isFirebaseConfigured } from '@/lib/firebase-admin';
import { ModeSwitch } from './dashboard/components/mode-switch';
import { AppLayoutClient } from './components/app-layout-client';
import { getCollections } from '@/lib/data';
import { getRequiredCurrentUser } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getRequiredCurrentUser();
  const mode = cookies().get('app-mode')?.value === 'live' ? 'live' : 'demo';
  const isConfigured = isFirebaseConfigured;
  const collections = await getCollections();

  const modeSwitchComponent = (
    <>
      <ModeSwitch initialMode={mode} isConfigured={isConfigured} />
      <p className="text-xs text-muted-foreground pt-2">
        {isConfigured ? "Alterna entre datos reales y de demostración." : "Firebase no configurado. Solo modo demo disponible."}
      </p>
    </>
  );

  return (
    <AppLayoutClient user={user} modeSwitch={modeSwitchComponent} collections={collections}>
      {children}
    </AppLayoutClient>
  );
}
