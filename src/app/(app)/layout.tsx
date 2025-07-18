

import * as React from 'react';
import { isFirebaseConfigured } from '@/lib/firebase-admin';
import { AppLayoutClient } from './components/app-layout-client';
import { getCollections } from '@/lib/data';
import { getRequiredCurrentUser } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import admin from 'firebase-admin';

// This function checks if Firestore has been initialized by trying a simple read.
async function isFirestoreReady(): Promise<boolean> {
  if (!isFirebaseConfigured) return false;
  try {
    // Attempt a simple, low-cost read operation.
    await admin.firestore().collection('_internal_test').limit(1).get();
    return true;
  } catch (error: any) {
    // A '5 NOT_FOUND' error specifically indicates the database hasn't been created.
    if (error.code === 5) {
      return false;
    }
    // For other errors, we assume it's ready but might have other issues.
    return true;
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getRequiredCurrentUser();
  const collections = await getCollections();
  const firestoreReady = await isFirestoreReady();

  return (
    <AppLayoutClient user={user} collections={collections}>
      {!firestoreReady && isFirebaseConfigured && (
          <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Acción Requerida: Crear Base de Datos de Firestore</AlertTitle>
              <AlertDescription>
                  Tu aplicación está conectada a Firebase, pero la base de datos de Firestore no ha sido creada. Por favor, ve a tu consola de Firebase, navega a la sección de Firestore y crea una nueva base de datos para empezar.
              </AlertDescription>
          </Alert>
      )}
      {children}
    </AppLayoutClient>
  );
}
