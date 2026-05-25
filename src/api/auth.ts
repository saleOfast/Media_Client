import { API_BASE_URL } from "../config/api";
import type {
    AuthUser,
    FieldPermission,
    TabPermission,
    TablePermission,
    UserPermissions,
} from "../Types/auth";

const AUTH_BASE = `${API_BASE_URL.replace(/\/$/, "")}/auth`;
const LOGIN_URL = `${AUTH_BASE}/login`;
const FORGOT_PASSWORD_URL = `${AUTH_BASE}/forgot-password`;
const RESET_PASSWORD_URL = `${AUTH_BASE}/reset-password`;

export type LoginPayload = {
    /** API expects `identifier` (e.g. email); `email` is rejected by the server. */
    identifier: string;
    password: string;
};

export type LoginResult = {
    token: string;
    raw: unknown;
    user: AuthUser;
    permissions: UserPermissions | null;
    canSetup: boolean;
};

/** Decode JWT payload and read `canSetup` (setup administrator flag). */
export function parseCanSetupFromToken(token: string | null | undefined): boolean {
    if (!token || typeof token !== "string") {
        return false;
    }
    const parts = token.split(".");
    if (parts.length < 2) {
        return false;
    }
    try {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const json = atob(padded);
        const payload = JSON.parse(json) as Record<string, unknown>;
        return payload.canSetup === true;
    } catch {
        return false;
    }
}

function formatAuthError(body: unknown, fallback: string): string {
    if (!body || typeof body !== "object") {
        return fallback;
    }
    const record = body as Record<string, unknown>;
    const message = typeof record.message === "string" ? record.message : "";
    const details = record.details;
    if (Array.isArray(details) && details.length > 0) {
        const lines = details.map((d) => (typeof d === "string" ? d : JSON.stringify(d)));
        return [message, ...lines].filter(Boolean).join(" — ");
    }
    return message || fallback;
}

function extractTokenFromBody(data: unknown): string | null {
    if (!data || typeof data !== "object") {
        return null;
    }
    const record = data as Record<string, unknown>;
    const direct =
        record.token ??
        record.accessToken ??
        record.access_token ??
        record.jwt ??
        record.authToken;
    if (typeof direct === "string" && direct.length > 0) {
        return direct;
    }
    const nested = record.data;
    if (nested && typeof nested === "object") {
        const inner = nested as Record<string, unknown>;
        const innerToken =
            inner.token ?? inner.accessToken ?? inner.access_token ?? inner.jwt;
        if (typeof innerToken === "string" && innerToken.length > 0) {
            return innerToken;
        }
    }
    return null;
}

function pickString(...values: unknown[]): string | undefined {
    for (const value of values) {
        if (typeof value === "string" && value.trim().length > 0) {
            return value.trim();
        }
    }
    return undefined;
}

function parseBoolean(value: unknown): boolean | undefined {
    return typeof value === "boolean" ? value : undefined;
}

function normalizeTabPermission(item: Record<string, unknown>): TabPermission | null {
    const tabName = pickString(item.tabName, item.name, item.key, item.label);
    if (!tabName) {
        return null;
    }
    const isVisible = parseBoolean(item.isVisible ?? item.visible ?? item.enabled) ?? false;
    return {
        tabName,
        tabLabel: pickString(item.tabLabel, item.label, item.displayName),
        isVisible,
        /** Same as API `isVisible` (profile “Default On”); not `isDefaultNav` */
        defaultOn: isVisible,
        isDefaultNav: parseBoolean(item.isDefaultNav ?? item.default),
    };
}

function normalizeTablePermission(item: Record<string, unknown>): TablePermission | null {
    const tableName = pickString(item.tableName, item.name, item.key);
    if (!tableName) {
        return null;
    }
    return {
        tableName,
        canRead: parseBoolean(item.canRead ?? item.read),
        canCreate: parseBoolean(item.canCreate ?? item.create),
        canEdit: parseBoolean(item.canEdit ?? item.edit ?? item.canWrite ?? item.write),
        canDelete: parseBoolean(item.canDelete ?? item.delete),
        canWrite: parseBoolean(item.canWrite ?? item.write),
    };
}

function normalizeFieldPermission(item: Record<string, unknown>): FieldPermission | null {
    const tableName = pickString(item.tableName);
    const fieldName = pickString(item.fieldName, item.name);
    if (!tableName || !fieldName) {
        return null;
    }
    return {
        id: pickString(item.id),
        profileId: pickString(item.profileId),
        tableName,
        fieldName,
        isMandatory: item.isMandatory === true,
        isReadOnly: item.isReadOnly === true,
        isEditable: item.isEditable !== false,
    };
}

export function parsePermissionsFromLoginResponse(body: unknown): UserPermissions | null {
    if (!body || typeof body !== "object") {
        return null;
    }
    const root = body as Record<string, unknown>;
    const dataObj =
        root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : null;
    const perms =
        (root.permissions && typeof root.permissions === "object" ? root.permissions : null) ??
        (dataObj?.permissions && typeof dataObj.permissions === "object"
            ? dataObj.permissions
            : null);
    if (!perms || typeof perms !== "object") {
        return null;
    }
    const record = perms as Record<string, unknown>;

    return {
        profileId: String(record.profileId ?? ""),
        cacheVersion: typeof record.cacheVersion === "number" ? record.cacheVersion : 0,
        tabs: Array.isArray(record.tabs)
            ? record.tabs
                  .map((item) =>
                      item && typeof item === "object"
                          ? normalizeTabPermission(item as Record<string, unknown>)
                          : null
                  )
                  .filter((item): item is TabPermission => item !== null)
            : [],
        tables: Array.isArray(record.tables)
            ? record.tables
                  .map((item) =>
                      item && typeof item === "object"
                          ? normalizeTablePermission(item as Record<string, unknown>)
                          : null
                  )
                  .filter((item): item is TablePermission => item !== null)
            : [],
        fields: Array.isArray(record.fields)
            ? record.fields
                  .map((item) =>
                      item && typeof item === "object"
                          ? normalizeFieldPermission(item as Record<string, unknown>)
                          : null
                  )
                  .filter((item): item is FieldPermission => item !== null)
            : [],
        recordTypeAccess: Array.isArray(record.recordTypeAccess) ? record.recordTypeAccess : [],
    };
}

/** Reads common API shapes for name / role after login. */
export function parseUserFromLoginResponse(body: unknown, identifierFallback: string): AuthUser {
    const idFallback = identifierFallback.trim();
    if (!body || typeof body !== "object") {
        return {
            displayName: displayNameFromIdentifier(idFallback),
            identifier: idFallback || undefined,
            email: idFallback.includes("@") ? idFallback : undefined,
        };
    }
    const root = body as Record<string, unknown>;
    const data = root.data;
    const dataObj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;

    const userObj =
        (root.user && typeof root.user === "object" ? root.user : null) ??
        (dataObj?.user && typeof dataObj.user === "object" ? dataObj.user : null) ??
        (root.profile && typeof root.profile === "object" ? root.profile : null);

    const fromUser = userObj && typeof userObj === "object" ? (userObj as Record<string, unknown>) : null;

    const displayName =
        pickString(
            fromUser?.name,
            fromUser?.fullName,
            fromUser?.displayName,
            fromUser?.username,
            fromUser?.email,
            dataObj?.name,
            dataObj?.fullName,
            dataObj?.displayName,
            root.name,
            root.fullName,
            root.displayName,
            root.username
        ) ?? displayNameFromIdentifier(identifierFallback);

    const role = pickString(fromUser?.role, fromUser?.title, dataObj?.role, root.role) ?? "";

    const email =
        pickString(fromUser?.email, dataObj?.email, root.email) ??
        (identifierFallback.includes("@") ? identifierFallback.trim() : undefined);

    const identifier =
        pickString(fromUser?.identifier, fromUser?.login, fromUser?.username, root.identifier) ??
        identifierFallback.trim();

    return {
        id: pickString(fromUser?.id, dataObj?.id),
        displayName,
        role: role || undefined,
        identifier: identifier || undefined,
        email: email || undefined,
        phone: pickString(fromUser?.phone, fromUser?.mobile, dataObj?.phone, root.phone),
        department: pickString(fromUser?.department, dataObj?.department, root.department),
        employeeId: pickString(fromUser?.employeeId, fromUser?.employee_id, dataObj?.employeeId, root.employeeId),
        profileId: pickString(fromUser?.profileId, dataObj?.profileId),
        roleId: pickString(fromUser?.roleId, dataObj?.roleId),
        username: pickString(fromUser?.username, dataObj?.username),
    };
}

function displayNameFromIdentifier(identifier: string): string {
    const trimmed = identifier.trim();
    if (!trimmed) {
        return "User";
    }
    const at = trimmed.indexOf("@");
    if (at > 0) {
        return trimmed.slice(0, at);
    }
    return trimmed;
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResult> {
    const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const text = await response.text().catch(() => "");
    let body: unknown = null;
    if (text) {
        try {
            body = JSON.parse(text) as unknown;
        } catch {
            body = text;
        }
    }

    if (!response.ok) {
        throw new Error(formatAuthError(body, text || `Login failed (${response.status})`));
    }

    const token = extractTokenFromBody(body);
    if (!token) {
        throw new Error("Login succeeded but no token was returned. Check API response shape.");
    }

    const user = parseUserFromLoginResponse(body, payload.identifier);
    const permissions = parsePermissionsFromLoginResponse(body);
    const canSetup = parseCanSetupFromToken(token);

    return { token, raw: body, user, permissions, canSetup };
}

export type ForgotPasswordPayload = {
    email: string;
};

export async function forgotPasswordRequest(payload: ForgotPasswordPayload): Promise<string> {
    const response = await fetch(FORGOT_PASSWORD_URL, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: payload.email.trim() }),
    });

    const text = await response.text().catch(() => "");
    let body: unknown = null;
    if (text) {
        try {
            body = JSON.parse(text) as unknown;
        } catch {
            body = text;
        }
    }

    if (!response.ok) {
        throw new Error(formatAuthError(body, text || `Request failed (${response.status})`));
    }

    if (body && typeof body === "object" && typeof (body as Record<string, unknown>).message === "string") {
        return (body as Record<string, unknown>).message as string;
    }
    return "If an account exists for that email, a password reset link has been sent.";
}

export type ResetPasswordPayload = {
    token: string;
    password: string;
};

export async function resetPasswordRequest(payload: ResetPasswordPayload): Promise<string> {
    const response = await fetch(RESET_PASSWORD_URL, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: payload.token.trim(),
            password: payload.password,
        }),
    });

    const text = await response.text().catch(() => "");
    let body: unknown = null;
    if (text) {
        try {
            body = JSON.parse(text) as unknown;
        } catch {
            body = text;
        }
    }

    if (!response.ok) {
        throw new Error(formatAuthError(body, text || `Reset failed (${response.status})`));
    }

    if (body && typeof body === "object" && typeof (body as Record<string, unknown>).message === "string") {
        return (body as Record<string, unknown>).message as string;
    }
    return "Password updated successfully. You can sign in with your new password.";
}
