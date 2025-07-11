
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
    // The private key must be formatted correctly before passing to the SDK.
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const hasCredentials = !!(serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey);

// Initialize Firebase only if it hasn't been initialized yet and credentials are provided
if (!admin.apps.length && hasCredentials) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
        });
        console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
        console.error('Firebase Admin SDK Initialization Error:', error.message);
    }
}

const isFirebaseConfigured = admin.apps.length > 0 && hasCredentials;

if (isFirebaseConfigured) {
    firestoreAdmin = admin.firestore();
    authAdmin = admin.auth();
    storageAdmin = admin.storage();
} else if (!hasCredentials) {
    console.warn('Firebase Admin credentials not provided in .env.local. App will default to demo mode.');
}


export { firestoreAdmin, authAdmin, storageAdmin, isFirebaseConfigured };
