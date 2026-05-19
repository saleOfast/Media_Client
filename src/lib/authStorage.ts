const TOKEN_KEY = "eo_auth_token";
const USER_KEY = "eo_auth_user";

export type StoredUser = {
    displayName: string;
    role?: string;
    /** Sign-in identifier (e.g. email) — always set on login from the form */
    identifier?: string;
    email?: string;
    phone?: string;
    department?: string;
    employeeId?: string;
};

export const getToken = (): string | null => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const getStoredUser = (): StoredUser | null => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw) as StoredUser;
        if (!parsed || typeof parsed.displayName !== "string") {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
};

export const setStoredUser = (user: StoredUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/** Clears token and cached user (call on logout). */
export const clearAuthSession = () => {
    clearToken();
    try {
        localStorage.removeItem(USER_KEY);
    } catch {
        /* ignore */
    }
};
