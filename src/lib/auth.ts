// In a real application, this file would contain logic to manage user sessions,
// like getting the current user from a session cookie.

// For demonstration purposes, we'll simulate the current user.
// This allows us to test the UI and authorization logic without a full auth system.

type UserRole = 'Admin' | 'Editor' | 'Viewer';

interface SimulatedUser {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
}

/**
 * Simulates fetching the currently logged-in user.
 * 
 * To test different permission levels, you can change the `role` variable
 * inside this function to 'Admin', 'Editor', or 'Viewer' and then refresh the app.
 * 
 * @returns A promise that resolves to the simulated user object.
 */
export async function getCurrentUser(): Promise<SimulatedUser> {
    //
    // === CHANGE THIS VALUE TO TEST DIFFERENT ROLES ===
    //
    const role: UserRole = 'Admin'; 
    //
    // Options: 'Admin', 'Editor', 'Viewer'
    //
    
    if (role === 'Admin') {
        return { 
            uid: 'sim-admin-01', 
            name: 'Simulated Admin', 
            email: 'admin@example.com', 
            role: 'Admin' 
        };
    }
    
    if (role === 'Editor') {
        return { 
            uid: 'sim-editor-01', 
            name: 'Simulated Editor', 
            email: 'editor@example.com', 
            role: 'Editor' 
        };
    }

    // Default to Viewer
    return { 
        uid: 'sim-viewer-01', 
        name: 'Simulated Viewer', 
        email: 'viewer@example.com', 
        role: 'Viewer' 
    };
}
