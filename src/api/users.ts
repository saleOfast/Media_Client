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

export type UserApiItem = Record<string, unknown> & {
    id?: string;
    username?: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    fullName?: string;
    name?: string;
    email?: string;
    mobile?: string | null;
    phone?: string | null;
    department?: string;
    division?: string | null;
    employeeId?: string;
    language?: string;
    timeZone?: string;
    nickname?: string | null;
    title?: string | null;
    country?: string | null;
    stateProvince?: string | null;
    region?: string | null;
    city?: string | null;
    zipPostalCode?: string | null;
    street?: string | null;
    team?: string | null;
    vertical?: string | null;
    joiningDate?: string | null;
    resignationDate?: string | null;
    profileId?: string | null;
    profileName?: string | null;
    roleId?: string | null;
    roleName?: string | null;
    reportsTo?: string | null;
    manager?: string | null;
    delegatedApproverId?: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type UserLookupMaps = {
    profileNameById?: Map<string, string>;
    roleNameById?: Map<string, string>;
};

export type UserRow = {
    id: string;
    user: string;
    username: string;
    email: string;
    department: string;
    profile: string;
    role: string;
    mobile: string;
    status: "Active" | "Inactive";
};

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
    department: string;
    division?: string;
    profileId: string;
    roleId?: string | null;
    manager?: string;
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

function unwrapUserArray(body: unknown): UserApiItem[] {
    if (Array.isArray(body)) {
        return body as UserApiItem[];
    }
    if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;
        const candidates = ["data", "users", "results", "items", "content"] as const;
        for (const key of candidates) {
            const value = record[key];
            if (Array.isArray(value)) {
                return value as UserApiItem[];
            }
            if (value && typeof value === "object") {
                const nested = value as Record<string, unknown>;
                for (const nestedKey of candidates) {
                    const nestedValue = nested[nestedKey];
                    if (Array.isArray(nestedValue)) {
                        return nestedValue as UserApiItem[];
                    }
                }
            }
        }
    }
    return [];
}

function resolveUserStatus(item: UserApiItem): "Active" | "Inactive" {
    if (typeof item.isActive === "boolean") {
        return item.isActive ? "Active" : "Inactive";
    }
    const status = String(item.status ?? "").toLowerCase();
    if (status === "inactive" || status === "disabled") {
        return "Inactive";
    }
    return "Active";
}

function resolveDisplayName(item: UserApiItem): string {
    const fullName = typeof item.fullName === "string" ? item.fullName.trim() : "";
    if (fullName) {
        return fullName;
    }
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (name) {
        return name;
    }
    const parts = [item.firstName, item.middleName, item.lastName]
        .map((part) => (typeof part === "string" ? part.trim() : ""))
        .filter(Boolean);
    if (parts.length > 0) {
        return parts.join(" ");
    }
    return String(item.username ?? item.email ?? item.id ?? "—");
}

function resolveNullableString(value: unknown): string {
    if (value === null || value === undefined) {
        return "—";
    }
    const text = String(value).trim();
    return text || "—";
}

function resolveProfileLabel(item: UserApiItem, profileNameById: Map<string, string>): string {
    if (typeof item.profileName === "string" && item.profileName.trim()) {
        return item.profileName.trim();
    }
    const profileId =
        item.profileId === null || item.profileId === undefined ? "" : String(item.profileId);
    if (profileId && profileNameById.has(profileId)) {
        return profileNameById.get(profileId) ?? profileId;
    }
    return profileId || "—";
}

function resolveRoleLabel(item: UserApiItem, roleNameById: Map<string, string>): string {
    if (typeof item.roleName === "string" && item.roleName.trim()) {
        return item.roleName.trim();
    }
    const roleId = item.roleId === null || item.roleId === undefined ? "" : String(item.roleId);
    if (roleId && roleNameById.has(roleId)) {
        return roleNameById.get(roleId) ?? roleId;
    }
    return roleId || "—";
}

export function mapUserApiItemsToRows(
    items: UserApiItem[],
    maps: UserLookupMaps = {}
): UserRow[] {
    const profileNameById = maps.profileNameById ?? new Map<string, string>();
    const roleNameById = maps.roleNameById ?? new Map<string, string>();
    return items.map((item) => mapUserApiItemToRow(item, profileNameById, roleNameById));
}

export function mapUserApiItemToRow(
    item: UserApiItem,
    profileNameById: Map<string, string> = new Map(),
    roleNameById: Map<string, string> = new Map()
): UserRow {
    return {
        id: String(item.id ?? ""),
        user: resolveDisplayName(item),
        username: resolveNullableString(item.username),
        email: resolveNullableString(item.email),
        department: resolveNullableString(item.department),
        profile: resolveProfileLabel(item, profileNameById),
        role: resolveRoleLabel(item, roleNameById),
        mobile: resolveNullableString(item.mobile ?? item.phone),
        status: resolveUserStatus(item),
    };
}

export async function fetchUsers(): Promise<UserApiItem[]> {
    const response = await fetch(USERS_URL, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const body = await parseResponseBody(response);
        throw new Error(formatApiError(body, `Failed to load users (${response.status})`));
    }
    const body = await parseResponseBody(response);
    return unwrapUserArray(body);
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
    department: string;
    division: string;
    profileId: string;
    roleId: string;
    manager: string;
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
