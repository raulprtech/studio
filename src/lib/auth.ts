// En una aplicación real, este archivo contendría la lógica para gestionar las sesiones de usuario,
// como obtener el usuario actual a partir de una cookie de sesión.

// Para fines de demostración, simularemos el usuario actual.
// Esto nos permite probar la interfaz de usuario y la lógica de autorización sin un sistema de autenticación completo.

type UserRole = 'Admin' | 'Editor' | 'Viewer';

interface SimulatedUser {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
}

/**
 * Simula la obtención del usuario que ha iniciado sesión actualmente.
 * 
 * Para probar diferentes niveles de permisos, puedes cambiar la variable `role`
 * dentro de esta función a 'Admin', 'Editor' o 'Viewer' y luego refrescar la aplicación.
 * 
 * @returns Una promesa que se resuelve con el objeto del usuario simulado.
 */
export async function getCurrentUser(): Promise<SimulatedUser> {
    //
    // === CAMBIA ESTE VALOR PARA PROBAR DIFERENTES ROLES ===
    //
    const role: UserRole = 'Admin'; 
    //
    // Opciones: 'Admin', 'Editor', 'Viewer'
    //
    
    if (role === 'Admin') {
        return { 
            uid: 'sim-admin-01', 
            name: 'Admin Simulado', 
            email: 'admin@example.com', 
            role: 'Admin' 
        };
    }
    
    if (role === 'Editor') {
        return { 
            uid: 'sim-editor-01', 
            name: 'Editor Simulado', 
            email: 'editor@example.com', 
            role: 'Editor' 
        };
    }

    // Por defecto, Lector
    return { 
        uid: 'sim-viewer-01', 
        name: 'Lector Simulado', 
        email: 'viewer@example.com', 
        role: 'Viewer' 
    };
}
