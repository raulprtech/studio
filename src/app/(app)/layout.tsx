

import * as React from 'react';
import { AppLayoutClient } from './components/app-layout-client';
import { getCollections } from '@/lib/data';
import { getRequiredCurrentUser } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getRequiredCurrentUser();
  const collections = await getCollections();

  return (
    <AppLayoutClient user={user} collections={collections}>
      {children}
    </AppLayoutClient>
  );
}
