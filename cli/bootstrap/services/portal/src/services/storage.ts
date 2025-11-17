/**
 * Auth token
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem('GE_AUTH_TOKEN');
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

export function setAuthToken(authToken: string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('GE_AUTH_TOKEN', authToken);
    } catch (error) {
        console.error('Error setting auth token:', error);
    }
}

export function removeAuthToken(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem('GE_AUTH_TOKEN');
    } catch (error) {
        console.error('Error removing auth token:', error);
    }
}

/**
 * Auth user
 */
export function getAuthUser(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem('GE_AUTH_USER');
    } catch (error) {
        console.error('Error getting auth user:', error);
        return null;
    }
}

export function setAuthUser(authUser: string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('GE_AUTH_USER', authUser);
    } catch (error) {
        console.error('Error setting auth user:', error);
    }
}

export function removeAuthUser(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem('GE_AUTH_USER');
    } catch (error) {
        console.error('Error removing auth user:', error);
    }
}
