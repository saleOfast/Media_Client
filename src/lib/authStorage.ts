import { getTokenFromStorage, loadAuthSession, clearAuthSessionStorage } from "./authSessionStorage";
import type { AuthUser } from "../Types/auth";

export type StoredUser = AuthUser;

export const getToken = (): string | null => getTokenFromStorage();

export const setToken = (_token: string) => {
    /* Persisted via Redux setCredentials */
};

export const getStoredUser = (): AuthUser | null => loadAuthSession()?.user ?? null;

export const setStoredUser = (_user: AuthUser) => {
    /* Persisted via Redux setCredentials */
};

export const clearAuthSession = (): void => {
    clearAuthSessionStorage();
};
