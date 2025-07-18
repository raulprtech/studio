

import * as React from 'react';
import { isFirebaseConfigured } from '@/lib/firebase-admin';
import { AppLayoutClient } from './components/app-layout-client';
import { getCollections } from '@/lib/data';
import { getRequiredCurrentUser } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import admin from 'firebase-admin';

async function getFirestoreStatus(): Promise<{ ready: boolean; permissionError: boolean }> {
    if (!isFirebaseConfigured) {
        return { ready: false, permissionError: false };
    }
    try {
        // Attempt a minimal read operation. listCollections() is often restricted.
        // A direct, limited query is a better test for basic read permissions.
        await admin.firestore().collection('_schemas').limit(1).get();
        return { ready: true, permissionError: false };
    } catch (error: any) {
        // This is the key: Error code 5 for the Admin SDK often means the API
        // is not enabled or the service account lacks permissions, not that the
        // resource is missing.
        if (error.code === 5 || (error.message && error.message.includes('NOT_FOUND'))) {
            console.error("Firestore API Permission/Not-Enabled Error Detected. Code: 5 NOT_FOUND.", error.message);
            return { ready: false, permissionError: true };
        }
        // This handles cases where the _schemas collection truly doesn't exist yet, which is not an error.
        if (error.message && error.message.includes("Could not find a project associated with the provided credentials")) {
             return { ready: true, permissionError: false };
        }

        console.error("An unexpected error occurred while checking Firestore status.", error);
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
                    La cuenta de servicio de Firebase no tiene permisos para acceder a la API de Firestore o la API no está habilitada.
                    Por favor, ve a la Google Cloud Console de tu proyecto, navega a la sección &quot;APIs &amp; Services&quot;, y asegúrate de que la <strong>Cloud Firestore API</strong> esté habilitada. Si ya está habilitada, verifica los roles de IAM de tu cuenta de servicio.
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
