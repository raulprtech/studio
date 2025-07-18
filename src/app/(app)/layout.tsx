

import * as React from 'react';
import { isFirebaseConfigured, firestoreAdmin } from '@/lib/firebase-admin';
import { AppLayoutClient } from './components/app-layout-client';
import { getCollections } from '@/lib/data';
import { getRequiredCurrentUser } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

async function getFirestoreStatus(): Promise<{ ready: boolean; permissionError: boolean }> {
    if (!isFirebaseConfigured || !firestoreAdmin) {
        return { ready: false, permissionError: false };
    }
    try {
        // Attempt a minimal read operation on a non-existent document.
        // This is a reliable way to check for permissions/API status.
        await firestoreAdmin.collection('_internal_test_collection').doc('test_doc').get();
        return { ready: true, permissionError: false };
    } catch (error: any) {
        // A 5 NOT_FOUND error code on this specific test strongly indicates a permission issue
        // or that the Firestore API is not enabled, rather than the collection not existing.
        if (error.code === 5) {
            console.error("Firestore API Permission/Not-Enabled Error Detected. Code: 5 NOT_FOUND.", error.message);
            return { ready: false, permissionError: true };
        }
         // This handles cases where Firestore itself hasn't been created yet.
         // This is a less likely scenario if the user has already created collections.
        if (error.message && error.message.includes("Could not find a project associated with the provided credentials")) {
             return { ready: true, permissionError: false }; // Not a permission error, but a setup one.
        }

        console.error("An unexpected error occurred while checking Firestore status.", error);
        return { ready: false, permissionError: false }; // Other unknown errors
    }
}


export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getRequiredCurrentUser();
  const collections = await getCollections();
  const firestoreStatus = await getFirestoreStatus();

  return (
    <AppLayoutClient user={user} collections={collections}>
       {firestoreStatus.permissionError && (
          <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de Permisos de la API de Firestore</AlertTitle>
              <AlertDescription>
                La cuenta de servicio de Firebase no tiene permisos para acceder a la API de Firestore o la API no está habilitada.
                Por favor, ve a la Google Cloud Console de tu proyecto, navega a la sección &quot;APIs &amp; Services&quot;, y asegúrate de que la <strong>Cloud Firestore API</strong> esté habilitada. Si ya está habilitada, verifica los roles de IAM de tu cuenta de servicio.
              </AlertDescription>
          </Alert>
      )}
      {children}
    </AppLayoutClient>
  );
}
