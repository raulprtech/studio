
import * as React from 'react';
import { isFirebaseConfigured } from '@/lib/firebase-admin';
import { AppLayoutClient } from './components/app-layout-client';
import { getCollections } from '@/lib/data';
import { getRequiredCurrentUser } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getRequiredCurrentUser();
  const collections = await getCollections();

  return (
    <AppLayoutClient user={user} collections={collections}>
      {!isFirebaseConfigured && (
          <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Firebase no está configurado</AlertTitle>
              <AlertDescription>
                  Tu aplicación no está conectada a Firebase. Por favor, añade las variables de entorno de tu proyecto de Firebase al archivo `.env.local` para habilitar todas las funcionalidades.
              </AlertDescription>
          </Alert>
      )}
      {children}
    </AppLayoutClient>
  );
}
