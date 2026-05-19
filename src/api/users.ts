import { API_BASE_URL } from "../config/api";
import { getToken } from "../lib/authStorage";

const USERS_URL = `${API_BASE_URL.replace(/\/$/, "")}/users`;

function authHeaders(): HeadersInit {
    const headers: Record<string, string> = { Accept: "application/json" };
    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

function jsonHeaders(): HeadersInit {
    return {
        ...authHeaders(),
        "Content-Type": "application/json",
    };
}

/** Request body for POST /users */
export type CreateUserPayload = {
    firstName: string;
    middleName?: string;
    lastName: string;
    fullName?: string;
    name?: string;
    username?: string;
    nickname?: string;
    email: string;
    phone?: string;
    mobile?: string;
    active: boolean;
    department: string;
    division?: string;
    profileId: string;
    roleId?: string | null;
    manager?: string;
    reportsTo?: string;
    delegatedApprover?: string;
    team?: string;
    vertical?: string;
    country?: string;
    stateProvince?: string;
    region?: string;
    city?: string;
    zipPostalCode?: string;
    street?: string;
    employeeId?: string;
    title?: string;
    language?: string;
    timeZone?: string;
    joiningDate?: string;
    resignationDate?: string;
};

async function parseResponseBody(response: Response): Promise<unknown> {
    const text = await response.text().catch(() => "");
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return text;
    }
}

function formatApiError(body: unknown, fallback: string): string {
    if (typeof body === "string" && body.trim()) {
        return body;
    }
    if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;
        const message = typeof record.message === "string" ? record.message : "";
        const details = record.details;
        if (Array.isArray(details) && details.length > 0) {
            const lines = details.map((item) =>
                typeof item === "string" ? item : JSON.stringify(item)
            );
            return [message, ...lines].filter(Boolean).join(" — ");
        }
        if (message) {
            return message;
        }
    }
    return fallback;
}

export function buildCreateUserPayload(input: {
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    name: string;
    username: string;
    nickname: string;
    email: string;
    phone: string;
    mobile: string;
    active: boolean;
    department: string;
    division: string;
    profileId: string;
    roleId: string;
    manager: string;
    reportsTo: string;
    delegatedApprover: string;
    team: string;
    vertical: string;
    country: string;
    stateProvince: string;
    region: string;
    city: string;
    zipPostalCode: string;
    street: string;
    employeeId: string;
    title: string;
    language: string;
    timeZone: string;
    joiningDate: string;
    resignationDate: string;
}): CreateUserPayload {
    const payload: CreateUserPayload = {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim().toLowerCase(),
        active: input.active,
        department: input.department.trim(),
        profileId: input.profileId,
        roleId: input.roleId.trim() ? input.roleId.trim() : null,
    };

    const optionalStringFields: Array<keyof CreateUserPayload> = [
        "middleName",
        "fullName",
        "name",
        "username",
        "nickname",
        "phone",
        "mobile",
        "division",
        "manager",
        "reportsTo",
        "delegatedApprover",
        "team",
        "vertical",
        "country",
        "stateProvince",
        "region",
        "city",
        "zipPostalCode",
        "street",
        "employeeId",
        "title",
        "language",
        "timeZone",
        "joiningDate",
        "resignationDate",
    ];

    const source: Record<string, string> = {
        middleName: input.middleName,
        fullName: input.fullName,
        name: input.name,
        username: input.username,
        nickname: input.nickname,
        phone: input.phone,
        mobile: input.mobile,
        division: input.division,
        manager: input.manager,
        reportsTo: input.reportsTo,
        delegatedApprover: input.delegatedApprover,
        team: input.team,
        vertical: input.vertical,
        country: input.country,
        stateProvince: input.stateProvince,
        region: input.region,
        city: input.city,
        zipPostalCode: input.zipPostalCode,
        street: input.street,
        employeeId: input.employeeId,
        title: input.title,
        language: input.language,
        timeZone: input.timeZone,
        joiningDate: input.joiningDate,
        resignationDate: input.resignationDate,
    };

    for (const key of optionalStringFields) {
        const value = source[key]?.trim();
        if (value) {
            (payload as Record<string, unknown>)[key] = value;
        }
    }

    return payload;
}

export async function createUser(payload: CreateUserPayload): Promise<unknown> {
    const response = await fetch(USERS_URL, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    const body = await parseResponseBody(response);
    if (!response.ok) {
        throw new Error(formatApiError(body, `Failed to create user (${response.status})`));
    }
    return body;
}
