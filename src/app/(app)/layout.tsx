

import * as React from 'react';
import { isFirebaseConfigured } from '@/lib/firebase-admin';
import { AppLayoutClient } from './components/app-layout-client';
import { getCollections } from '@/lib/data';
import { getRequiredCurrentUser } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import admin from 'firebase-admin';

// This function checks if Firestore has been initialized by trying a simple read.
async function getFirestoreStatus(): Promise<{ ready: boolean, permissionError: boolean }> {
  if (!isFirebaseConfigured) return { ready: false, permissionError: false };
  try {
    // Attempt a simple, low-cost read operation.
    await admin.firestore().collection('_internal_test').limit(1).get();
    return { ready: true, permissionError: false };
  } catch (error: any) {
    // A '5 NOT_FOUND' error specifically indicates the database hasn't been created or there's a permission issue with the API.
    if (error.code === 5) {
        // This is a permission/API enablement issue, not that the DB doesn't exist.
        return { ready: false, permissionError: true };
    }
     // For other errors, we might not be sure if it's a creation problem or something else.
    return { ready: false, permissionError: false };
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getRequiredCurrentUser();
  const collections = await getCollections();
  const firestoreStatus = await getFirestoreStatus();

  return (
    <AppLayoutClient user={user} collections={collections}>
      {!firestoreStatus.ready && isFirebaseConfigured && (
          <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              {firestoreStatus.permissionError ? (
                <>
                  <AlertTitle>Error de Permisos de la API de Firestore</AlertTitle>
                  <AlertDescription>
                    Parece que tu cuenta de servicio de Firebase no tiene permisos para acceder a la API de Firestore o la API no está habilitada.
                    Por favor, ve a la Google Cloud Console de tu proyecto, navega a la sección "APIs y Servicios", y asegúrate de que la <strong>Cloud Firestore API</strong> esté habilitada.
                  </AlertDescription>
                </>
              ) : (
                 <>
                    <AlertTitle>Acción Requerida: Crear Base de Datos de Firestore</AlertTitle>
                    <AlertDescription>
                        Tu aplicación está conectada a Firebase, pero la base de datos de Firestore no ha sido creada o no se puede acceder a ella. Por favor, ve a tu consola de Firebase, navega a la sección de Firestore y crea una nueva base de datos para empezar.
                    </AlertDescription>
                 </>
              )}
          </Alert>
      )}
      {children}
    </AppLayoutClient>
  );
}
