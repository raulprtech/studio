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
