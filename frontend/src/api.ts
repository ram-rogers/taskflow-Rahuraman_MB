export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function getAuthToken() {
    return localStorage.getItem('token');
}

export function setAuthToken(token: string) {
    localStorage.setItem('token', token);
}

export function clearAuthToken() {
    localStorage.removeItem('token');
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as any),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorData: any;
        try {
            errorData = await response.json();
        } catch {
            errorData = { error: response.statusText };
        }
        // Attach HTTP status so callers can map to UX messages
        errorData.status = response.status;
        throw errorData;
    }

    // Handle 204 No Content
    if (response.status === 204) return null;

    return response.json();
}
