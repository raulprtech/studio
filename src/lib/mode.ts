
import 'server-only'
import { cookies } from 'next/headers'

export function getMode(): 'live' | 'demo' {
    const modeCookie = cookies().get('app-mode');
    return modeCookie?.value === 'live' ? 'live' : 'demo';
}
