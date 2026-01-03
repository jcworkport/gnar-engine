/**
 * Auth token
 */
export function getAuthToken() {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem('GE_AUTH_TOKEN');
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

export function setAuthToken(authToken) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('GE_AUTH_TOKEN', authToken);
    } catch (error) {
        console.error('Error setting auth token:', error);
    }
}

export function removeAuthToken() {
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
export function getAuthUser() {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem('GE_AUTH_USER');
    } catch (error) {
        console.error('Error getting auth user:', error);
        return null;
    }
}

export function setAuthUser(authUser) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('GE_AUTH_USER', authUser);
    } catch (error) {
        console.error('Error setting auth user:', error);
    }
}

export function removeAuthUser() {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem('GE_AUTH_USER');
    } catch (error) {
        console.error('Error removing auth user:', error);
    }
}

