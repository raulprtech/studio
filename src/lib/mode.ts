
import { cookies } from 'next/headers';
import { isFirebaseConfigured } from './firebase-admin';

function isAnalyticsEnvConfigured() {
    // Analytics depends on Firebase creds being available for the client library
    return !!process.env.GOOGLE_ANALYTICS_PROPERTY_ID && isFirebaseConfigured;
}

function shouldUseLiveServices() {
    const modeCookie = cookies().get('app-mode');
    // Default to 'demo' unless the cookie is explicitly set to 'live'
    return modeCookie?.value === 'live';
}

/**
 * Determines if the app should use live Firebase services for the current request.
 * Checks for both the app mode cookie and if Firebase is properly configured.
 * @returns {boolean} True if live Firebase services should be used.
 */
export function isFirebaseLive(): boolean {
    return shouldUseLiveServices() && isFirebaseConfigured;
}

/**
 * Determines if the app should use the live Google Analytics service for the current request.
 * Checks for the app mode cookie and if both Firebase and Analytics are configured.
 * @returns {boolean} True if live Analytics services should be used.
 */
export function isAnalyticsLive(): boolean {
    return shouldUseLiveServices() && isAnalyticsEnvConfigured();
}
