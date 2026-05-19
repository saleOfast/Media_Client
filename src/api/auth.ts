import type { StoredUser } from "../lib/authStorage";
import { API_BASE_URL } from "../config/api";

const LOGIN_URL = `${API_BASE_URL.replace(/\/$/, "")}/auth/login`;

export type LoginPayload = {
    /** API expects `identifier` (e.g. email); `email` is rejected by the server. */
    identifier: string;
    password: string;
};

export type LoginResult = {
    token: string;
    raw: unknown;
    user: StoredUser;
};

function formatLoginError(body: unknown, fallback: string): string {
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

/** Reads common API shapes for name / role after login. */
export function parseUserFromLoginResponse(body: unknown, identifierFallback: string): StoredUser {
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
        displayName,
        role: role || undefined,
        identifier: identifier || undefined,
        email: email || undefined,
        phone: pickString(fromUser?.phone, fromUser?.mobile, dataObj?.phone, root.phone),
        department: pickString(fromUser?.department, dataObj?.department, root.department),
        employeeId: pickString(fromUser?.employeeId, fromUser?.employee_id, dataObj?.employeeId, root.employeeId),
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
        throw new Error(formatLoginError(body, text || `Login failed (${response.status})`));
    }

    const token = extractTokenFromBody(body);
    if (!token) {
        throw new Error("Login succeeded but no token was returned. Check API response shape.");
    }

    const user = parseUserFromLoginResponse(body, payload.identifier);

    return { token, raw: body, user };
}
