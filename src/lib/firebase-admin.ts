
import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

let firestoreAdmin: Firestore | undefined;
let authAdmin: Auth | undefined;
let storageAdmin: Storage | undefined;

const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const hasCredentials = !!(serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey);
const isFirebaseConfigured = admin.apps.length > 0 && hasCredentials;

if (!admin.apps.length && hasCredentials) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
        console.log('Firebase Admin SDK initialized successfully.');
        firestoreAdmin = admin.firestore();
        authAdmin = admin.auth();
        storageAdmin = admin.storage();
    } catch (error: any) {
        console.error('Firebase Admin SDK Initialization Error:', error.stack);
    }
} else if (admin.apps.length && hasCredentials) {
    // If initialized, just get the services
    firestoreAdmin = admin.firestore();
    authAdmin = admin.auth();
    storageAdmin = admin.storage();
} else if (!hasCredentials) {
    console.warn('Firebase Admin credentials not provided in .env.local. Some features will be disabled.');
}

export { firestoreAdmin, authAdmin, storageAdmin, isFirebaseConfigured };
