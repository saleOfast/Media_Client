import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { parseCanSetupFromToken } from "../api/auth";
import {
    clearAuthSessionStorage,
    loadAuthSession,
    saveAuthSession,
} from "../lib/authSessionStorage";
import type { AuthUser, UserPermissions } from "../Types/auth";

export type AuthState = {
    token: string | null;
    user: AuthUser | null;
    permissions: UserPermissions | null;
    canSetup: boolean;
    isHydrated: boolean;
};

const persisted = loadAuthSession();

const initialState: AuthState = {
    token: persisted?.token ?? null,
    user: persisted?.user ?? null,
    permissions: persisted?.permissions ?? null,
    canSetup:
        persisted?.canSetup ?? parseCanSetupFromToken(persisted?.token ?? null),
    isHydrated: true,
};

export type SetCredentialsPayload = {
    token: string;
    user: AuthUser;
    permissions: UserPermissions | null;
    canSetup?: boolean;
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.permissions = action.payload.permissions;
            state.canSetup =
                action.payload.canSetup ??
                parseCanSetupFromToken(action.payload.token);
            saveAuthSession({
                token: action.payload.token,
                user: action.payload.user,
                permissions: action.payload.permissions,
                canSetup: state.canSetup,
            });
        },
        clearCredentials: (state) => {
            state.token = null;
            state.user = null;
            state.permissions = null;
            state.canSetup = false;
            clearAuthSessionStorage();
        },
        updatePermissions: (state, action: PayloadAction<UserPermissions | null>) => {
            state.permissions = action.payload;
            if (state.token && state.user) {
                saveAuthSession({
                    token: state.token,
                    user: state.user,
                    permissions: action.payload,
                    canSetup: state.canSetup,
                });
            }
        },
    },
});

export const { setCredentials, clearCredentials, updatePermissions } = authSlice.actions;
export default authSlice.reducer;
