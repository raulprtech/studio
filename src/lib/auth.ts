'use server';
import 'server-only';
import { cookies } from 'next/headers';
import { authAdmin, isFirebaseConfigured } from './firebase-admin';
import { redirect } from 'next/navigation';

type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface AuthenticatedUser {
    uid: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
    role: UserRole;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    if (!isFirebaseConfigured) {
        console.warn('Firebase no está configurado, no se puede autenticar al usuario.');
        return null;
    }

    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedToken = await authAdmin!.verifySessionCookie(sessionCookie, true);
        const userRecord = await authAdmin!.getUser(decodedToken.uid);

        const user: AuthenticatedUser = {
            uid: userRecord.uid,
            name: userRecord.displayName || userRecord.email?.split('@')[0] || null,
            email: userRecord.email || null,
            avatar: userRecord.photoURL || null,
            role: (userRecord.customClaims?.role as UserRole) || 'Viewer', // Default to Viewer
        };

        return user;
    } catch (error) {
        console.error('Error al verificar la cookie de sesión:', String(error));
        // This likely means the cookie is invalid or expired.
        return null;
    }
}

export async function getRequiredCurrentUser(): Promise<AuthenticatedUser> {
    const user = await getCurrentUser();
    if (!user) {
        // This should theoretically be caught by middleware, but it's a good safeguard.
        redirect('/login');
    }
    return user;
}
