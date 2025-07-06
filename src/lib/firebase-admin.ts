'use server';

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// This needs to be done once per server instance.
// The check `!admin.apps.length` ensures this doesn't run on every hot-reload in development.
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key must be formatted correctly before passing to the SDK.
      // In the .env file, it should be a single line with `\n` for newlines.
      // This replace call ensures it's correctly parsed.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // Check if the essential environment variables are provided.
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Firebase Admin SDK credentials are not defined in environment variables.");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK Initialization Error: ', error.message);
    // This error will be thrown if the app can't initialize, making it clear
    // that the server-side functionality dependent on Firebase will not work.
    // It's crucial to have the .env.local file correctly configured.
    throw new Error(
      'Firebase Admin SDK failed to initialize. Please check your .env.local file and ensure all Firebase credentials are correct.'
    );
  }
}

// Export the initialized admin services.
// These can be imported into any server-side file (e.g., Server Actions, Route Handlers).
export const firestoreAdmin = admin.firestore();
export const authAdmin = admin.auth();
