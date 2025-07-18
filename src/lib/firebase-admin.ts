
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

// Define the structure for the admin services
interface FirebaseAdminServices {
  app: App;
  firestore: Firestore;
  auth: Auth;
  storage: Storage;
}

let adminServices: FirebaseAdminServices | null = null;

export const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

export const hasCredentials = !!(serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey);

function initializeFirebaseAdmin(): FirebaseAdminServices {
    if (admin.apps.length > 0) {
        const app = admin.apps[0]!;
        if (!adminServices) {
             adminServices = {
                app,
                firestore: admin.firestore(app),
                auth: admin.auth(app),
                storage: admin.storage(app),
            };
        }
        return adminServices;
    }

    if (!hasCredentials) {
        throw new Error('Firebase credentials not provided in environment variables. Cannot initialize Firebase Admin SDK.');
    }

    try {
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
        
        console.log('Firebase Admin SDK initialized successfully.');

        adminServices = {
            app,
            firestore: admin.firestore(app),
            auth: admin.auth(app),
            storage: admin.storage(app),
        };
        
        return adminServices;

    } catch (error: any) {
        console.error('Firebase Admin SDK Initialization Error:', error.stack);
        throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
    }
}


function getFirebaseAdmin() {
    if (!adminServices) {
        return initializeFirebaseAdmin();
    }
    return adminServices;
}

// Export individual services for use throughout the app
export const firestoreAdmin = hasCredentials ? getFirebaseAdmin().firestore : undefined;
export const authAdmin = hasCredentials ? getFirebaseAdmin().auth : undefined;
export const storageAdmin = hasCredentials ? getFirebaseAdmin().storage : undefined;
export const isFirebaseConfigured = hasCredentials;
