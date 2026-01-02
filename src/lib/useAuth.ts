/**
 * Authentication utilities for frontend
 */

const TOKEN_KEY = "token";
const USER_KEY = "user";

/**
 * Get stored JWT token
 */
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store JWT token
 */
export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove JWT token (logout)
 */
export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Get stored user info
 */
export function getUser(): { id: number; username: string; role: string; name: string } | null {
    const user = localStorage.getItem(USER_KEY);
    if (!user) return null;
    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}

/**
 * Store user info
 */
export function setUser(user: { id: number; username: string; role: string; name: string }): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getToken();
}

/**
 * Fetch with Authorization header
 * Automatically handles 401 responses by redirecting to login
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();

    // If no token, redirect to login
    if (!token) {
        logout();
        throw new Error("No authentication token");
    }

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // If unauthorized (token invalid/expired), redirect to login
    if (response.status === 401) {
        logout();
        throw new Error("Session expired");
    }

    return response;
}

/**
 * Logout and redirect to login page
 */
export function logout(): void {
    clearToken();
    window.location.href = "/login";
}
