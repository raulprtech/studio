
import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

let firestoreAdmin: Firestore | undefined;
let authAdmin: Auth | undefined;
let storageAdmin: Storage | undefined;
let isFirebaseConfigured = false;

// This check ensures this doesn't run on every hot-reload in development.
if (!admin.apps.length) {
    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must be formatted correctly before passing to the SDK.
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // Check if the essential environment variables are provided.
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
            isFirebaseConfigured = true;
            console.log('Firebase Admin SDK initialized successfully.');
        } catch (error: any) {
            console.error('Firebase Admin SDK Initialization Error:', error.message);
            isFirebaseConfigured = false;
        }
    } else {
        console.warn('Firebase Admin credentials not provided in .env.local. App will default to demo mode.');
    }
} else {
    isFirebaseConfigured = true;
}

if (isFirebaseConfigured) {
    firestoreAdmin = admin.firestore();
    authAdmin = admin.auth();
    storageAdmin = admin.storage();
}

export { firestoreAdmin, authAdmin, storageAdmin, isFirebaseConfigured };
