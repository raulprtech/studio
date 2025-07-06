import { type NextRequest, NextResponse } from 'next/server';
import { authAdmin, isFirebaseConfigured } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

// Create session cookie
export async function POST(request: NextRequest) {
    if (!isFirebaseConfigured) {
        return NextResponse.json({ error: 'Firebase no está configurado.' }, { status: 500 });
    }

    const body = await request.json();
    const idToken = body.idToken;

    if (!idToken) {
        return NextResponse.json({ error: 'ID token no proporcionado.' }, { status: 400 });
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    try {
        const decodedToken = await authAdmin!.verifyIdToken(idToken);
        const adminEmail = process.env.FIREBASE_ADMIN_EMAIL;

        // Check if the admin email is configured
        if (!adminEmail) {
            console.error('FIREBASE_ADMIN_EMAIL no está configurado. No se puede verificar al propietario del sitio.');
            return NextResponse.json({ error: 'La configuración del servidor está incompleta. No se puede iniciar sesión.' }, { status: 500 });
        }

        // Check if the user's email matches the owner's email
        if (decodedToken.email !== adminEmail) {
            return NextResponse.json({ error: 'Acceso denegado. Solo el propietario del sitio puede iniciar sesión.' }, { status: 403 });
        }

        // If it's the owner, ensure they have the Admin role
        const user = await authAdmin!.getUser(decodedToken.uid);
        if (user.customClaims?.role !== 'Admin') {
            await authAdmin!.setCustomUserClaims(user.uid, { role: 'Admin' });
        }
        
        const sessionCookie = await authAdmin!.createSessionCookie(idToken, { expiresIn });
        cookies().set('__session', sessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error al crear la cookie de sesión:', String(error));
        return NextResponse.json({ error: 'No se pudo crear la sesión.' }, { status: 401 });
    }
}

// Destroy session cookie
export async function DELETE(request: NextRequest) {
    try {
        cookies().delete('__session');
        return NextResponse.json({ success: true });
    } catch (error) {
         console.error('Error al eliminar la cookie de sesión:', String(error));
        return NextResponse.json({ error: 'No se pudo cerrar la sesión.' }, { status: 500 });
    }
}
