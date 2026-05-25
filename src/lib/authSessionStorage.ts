import type { AuthSession } from "../Types/auth";

export const AUTH_SESSION_KEY = "eo_auth_session";
const LEGACY_TOKEN_KEY = "eo_auth_token";
const LEGACY_USER_KEY = "eo_auth_user";

export function loadAuthSession(): AuthSession | null {
    try {
        const raw = localStorage.getItem(AUTH_SESSION_KEY);
        if (!raw) {
            return loadLegacySession();
        }
        const parsed = JSON.parse(raw) as AuthSession;
        if (!parsed?.token || !parsed?.user?.displayName) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

function loadLegacySession(): AuthSession | null {
    try {
        const token = localStorage.getItem(LEGACY_TOKEN_KEY);
        const userRaw = localStorage.getItem(LEGACY_USER_KEY);
        if (!token || !userRaw) {
            return null;
        }
        const user = JSON.parse(userRaw) as AuthSession["user"];
        if (!user?.displayName) {
            return null;
        }
        return { token, user, permissions: null };
    } catch {
        return null;
    }
}

export function saveAuthSession(session: AuthSession): void {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
}

export function clearAuthSessionStorage(): void {
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
}

export function getTokenFromStorage(): string | null {
    return loadAuthSession()?.token ?? null;
}
