import { API_BASE_URL } from "../config/api";
import { getToken } from "../lib/authStorage";

const ROLES_URL = `${API_BASE_URL.replace(/\/$/, "")}/roles`;

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

export type RoleApiItem = Record<string, unknown> & {
    id?: string;
    name?: string;
    description?: string;
    parentRoleId?: string | null;
    parentRoleName?: string | null;
    linkedProfileId?: string | null;
    linkedProfileName?: string | null;
    userCount?: number;
    assignedUsersCount?: number;
    status?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateRolePayload = {
    name: string;
    description: string;
    parentRoleId: string | null;
    linkedProfileId: string;
};

export type UpdateRolePayload = {
    name: string;
    description: string;
};

export type UpdateRoleParentPayload = {
    parentRoleId: string | null;
};

export type RoleRow = {
    id: string;
    roleName: string;
    parentRoleId: string | null;
    parentRoleName: string | null;
    reportsTo: string;
    linkedProfile: string;
    linkedProfileId: string;
    assignedUsers: number;
    description: string;
    status: "Active" | "Inactive";
    updatedOn: string;
};

const ROOT_PARENT_LABEL = "Top Level (Root)";

function unwrapRoleArray(body: unknown): RoleApiItem[] {
    if (Array.isArray(body)) {
        return body as RoleApiItem[];
    }
    if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;
        const candidates = ["data", "roles", "results", "items", "content"] as const;
        for (const key of candidates) {
            const value = record[key];
            if (Array.isArray(value)) {
                return value as RoleApiItem[];
            }
            if (value && typeof value === "object") {
                const nested = value as Record<string, unknown>;
                for (const nestedKey of candidates) {
                    const nestedValue = nested[nestedKey];
                    if (Array.isArray(nestedValue)) {
                        return nestedValue as RoleApiItem[];
                    }
                }
            }
        }
    }
    return [];
}

function unwrapRoleItem(body: unknown): RoleApiItem {
    if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;
        const data = record.data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
            return data as RoleApiItem;
        }
        if (record.id || record.name) {
            return record as RoleApiItem;
        }
    }
    return {};
}

function formatIsoDate(iso: unknown): string {
    if (typeof iso !== "string" || !iso) {
        return "—";
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString("en-GB").replaceAll("/", "-");
}

function resolveRoleStatus(item: RoleApiItem): "Active" | "Inactive" {
    if (typeof item.isActive === "boolean") {
        return item.isActive ? "Active" : "Inactive";
    }
    const status = String(item.status ?? "").toLowerCase();
    if (status === "inactive" || status === "disabled") {
        return "Inactive";
    }
    return "Active";
}

export function getRoleId(item: RoleApiItem): string {
    return String(item.id ?? "");
}

export function getRoleName(item: RoleApiItem): string {
    return String(item.name ?? item.id ?? "—");
}

function resolveParentRoleName(
    item: RoleApiItem,
    nameById: Map<string, string>
): { parentRoleId: string | null; parentRoleName: string | null; reportsTo: string } {
    const parentRoleId =
        item.parentRoleId === null || item.parentRoleId === undefined || item.parentRoleId === ""
            ? null
            : String(item.parentRoleId);

    if (!parentRoleId) {
        return {
            parentRoleId: null,
            parentRoleName: null,
            reportsTo: ROOT_PARENT_LABEL,
        };
    }

    const apiParentName =
        typeof item.parentRoleName === "string" && item.parentRoleName.trim()
            ? item.parentRoleName.trim()
            : null;
    const parentRoleName = apiParentName ?? nameById.get(parentRoleId) ?? null;

    return {
        parentRoleId,
        parentRoleName,
        reportsTo: parentRoleName ?? nameById.get(parentRoleId) ?? parentRoleId,
    };
}

function resolveLinkedProfileLabel(item: RoleApiItem): { linkedProfileId: string; linkedProfile: string } {
    const linkedProfileId =
        item.linkedProfileId === null || item.linkedProfileId === undefined
            ? ""
            : String(item.linkedProfileId);
    const linkedProfile =
        typeof item.linkedProfileName === "string" && item.linkedProfileName.trim()
            ? item.linkedProfileName.trim()
            : linkedProfileId || "—";

    return { linkedProfileId, linkedProfile };
}

function resolveUserCount(item: RoleApiItem): number {
    const count = item.userCount ?? item.assignedUsersCount ?? 0;
    return Number.isFinite(Number(count)) ? Number(count) : 0;
}

export function mapRoleApiItemsToRows(items: RoleApiItem[]): RoleRow[] {
    const nameById = new Map<string, string>();
    for (const item of items) {
        const id = getRoleId(item);
        if (id) {
            nameById.set(id, getRoleName(item));
        }
    }

    return items.map((item) => mapRoleApiItemToRow(item, nameById));
}

export function mapRoleApiItemToRow(
    item: RoleApiItem,
    nameById: Map<string, string> = new Map()
): RoleRow {
    const id = getRoleId(item);
    const parent = resolveParentRoleName(item, nameById);
    const profile = resolveLinkedProfileLabel(item);

    return {
        id,
        roleName: getRoleName(item),
        parentRoleId: parent.parentRoleId,
        parentRoleName: parent.parentRoleName,
        reportsTo: parent.reportsTo,
        linkedProfile: profile.linkedProfile,
        linkedProfileId: profile.linkedProfileId,
        assignedUsers: resolveUserCount(item),
        description: String(item.description ?? ""),
        status: resolveRoleStatus(item),
        updatedOn: formatIsoDate(item.updatedAt ?? item.createdAt),
    };
}

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

export async function fetchRoles(): Promise<RoleApiItem[]> {
    const response = await fetch(ROLES_URL, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to load roles (${response.status})`);
    }
    const body = await parseResponseBody(response);
    return unwrapRoleArray(body);
}

export async function fetchRoleById(roleId: string): Promise<RoleApiItem> {
    const response = await fetch(`${ROLES_URL}/${encodeURIComponent(roleId)}`, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to load role (${response.status})`);
    }
    const body = await parseResponseBody(response);
    return unwrapRoleItem(body);
}

export async function createRole(payload: CreateRolePayload): Promise<unknown> {
    const response = await fetch(ROLES_URL, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    const body = await parseResponseBody(response);
    if (!response.ok) {
        throw new Error(
            typeof body === "string" ? body : `Failed to create role (${response.status})`
        );
    }
    return body;
}

export async function updateRole(roleId: string, payload: UpdateRolePayload): Promise<unknown> {
    const response = await fetch(`${ROLES_URL}/${encodeURIComponent(roleId)}`, {
        method: "PATCH",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    const body = await parseResponseBody(response);
    if (!response.ok) {
        throw new Error(
            typeof body === "string" ? body : `Failed to update role (${response.status})`
        );
    }
    return body;
}

export async function updateRoleParent(
    roleId: string,
    payload: UpdateRoleParentPayload
): Promise<unknown> {
    const response = await fetch(`${ROLES_URL}/${encodeURIComponent(roleId)}/parent`, {
        method: "PATCH",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    const body = await parseResponseBody(response);
    if (!response.ok) {
        throw new Error(
            typeof body === "string" ? body : `Failed to update role parent (${response.status})`
        );
    }
    return body;
}

export async function deleteRole(roleId: string): Promise<void> {
    const response = await fetch(`${ROLES_URL}/${encodeURIComponent(roleId)}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to delete role (${response.status})`);
    }
}

export { ROOT_PARENT_LABEL };
