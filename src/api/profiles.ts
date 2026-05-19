import { API_BASE_URL } from "../config/api";
import { getToken } from "../lib/authStorage";

const PROFILES_URL = `${API_BASE_URL.replace(/\/$/, "")}/profiles`;
const TAB_PERMISSIONS_CATALOG_URL = `${PROFILES_URL}/table-permissions/catalog`;

function authHeaders(): HeadersInit {
    const headers: Record<string, string> = { Accept: "application/json" };
    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

export type CreateProfilePayload = {
    name: string;
    description: string;
    canSetup: boolean;
    department: string;
};

/** Raw item from GET/POST/PATCH profile APIs */
export type ProfileApiItem = Record<string, unknown> & {
    id?: string | number;
    name?: string;
    description?: string;
    canSetup?: boolean;
    department?: string | null;
    assignedUsersCount?: number;
    modifiedByName?: string;
    createdAt?: string;
    updatedAt?: string;
    permissionCacheVersion?: number;
};

export type TabPermissionCatalogItem = Record<string, unknown> & {
    id?: string | number;
    key?: string;
    name?: string;
    tabName?: string;
    label?: string;
    displayName?: string;
    description?: string;
    readOnly?: boolean;
    defaultOn?: boolean;
    enabled?: boolean;
};

function unwrapProfileArray(body: unknown): ProfileApiItem[] {
    if (Array.isArray(body)) {
        return body as ProfileApiItem[];
    }
    if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;
        const candidates = ["data", "profiles", "results", "items", "content"] as const;
        for (const key of candidates) {
            const value = record[key];
            if (Array.isArray(value)) {
                return value as ProfileApiItem[];
            }
        }
    }
    return [];
}

function normalizeTabPermissionCatalogItems(value: unknown): TabPermissionCatalogItem[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item, index): TabPermissionCatalogItem | null => {
            if (typeof item === "string") {
                return {
                    id: item,
                    key: item,
                    name: item,
                    tabName: item,
                    defaultOn: true,
                };
            }

            if (item && typeof item === "object") {
                return item as TabPermissionCatalogItem;
            }

            return {
                id: `tab-${index}`,
                name: String(item),
                tabName: String(item),
                defaultOn: true,
            };
        })
        .filter((item): item is TabPermissionCatalogItem => item !== null);
}

function unwrapTabPermissionCatalog(body: unknown): TabPermissionCatalogItem[] {
    if (Array.isArray(body)) {
        return normalizeTabPermissionCatalogItems(body);
    }
    if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;

        const data = record.data;
        if (data && typeof data === "object") {
            const nestedRecord = data as Record<string, unknown>;
            const nestedTabNames = nestedRecord.tabNames;
            if (Array.isArray(nestedTabNames)) {
                return normalizeTabPermissionCatalogItems(nestedTabNames);
            }
        }

        const candidates = ["data", "tabs", "tabPermissions", "permissions", "catalog", "items", "results"] as const;
        for (const key of candidates) {
            const value = record[key];
            if (Array.isArray(value)) {
                return normalizeTabPermissionCatalogItems(value);
            }
        }
    }
    return [];
}

export async function fetchProfiles(): Promise<ProfileApiItem[]> {
    const response = await fetch(PROFILES_URL, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to load profiles (${response.status})`);
    }
    const body: unknown = await response.json().catch(() => []);
    return unwrapProfileArray(body);
}

export async function fetchTabPermissionsCatalog(): Promise<TabPermissionCatalogItem[]> {
    const response = await fetch(TAB_PERMISSIONS_CATALOG_URL, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to load tab permissions catalog (${response.status})`);
    }
    const body: unknown = await response.json().catch(() => []);
    return unwrapTabPermissionCatalog(body);
}

export async function createProfile(payload: CreateProfilePayload): Promise<unknown> {
    const response = await fetch(PROFILES_URL, {
        method: "POST",
        headers: {
            ...authHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    const text = await response.text().catch(() => "");
    if (!response.ok) {
        throw new Error(text || `Failed to create profile (${response.status})`);
    }
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return text;
    }
}

export type UpdateProfilePayload = {
    name: string;
    description: string;
    canSetup: boolean;
    department: string;
};

export type SaveProfileTabPermissionPayload = {
    tabName: string;
    isVisible: boolean;
    isDefaultNav: boolean;
};

export type SaveProfileTablePermissionPayload = {
    tableName: string;
    canRead: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
};

export type ProfileEffectivePermissionItem = Record<string, unknown> & {
    tabName?: string;
    tableName?: string;
    name?: string;
    key?: string;
    isVisible?: boolean;
    isDefaultNav?: boolean;
    defaultOn?: boolean;
    enabled?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canWrite?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
};

function profileByIdUrl(profileId: string): string {
    return `${PROFILES_URL}/${encodeURIComponent(profileId)}`;
}

function profileTabPermissionsUrl(profileId: string): string {
    return `${profileByIdUrl(profileId)}/tab-permissions`;
}

function profileTablePermissionsUrl(profileId: string): string {
    return `${profileByIdUrl(profileId)}/table-permissions`;
}

function profileEffectiveUrl(profileId: string): string {
    return `${profileByIdUrl(profileId)}/effective`;
}

function profileFieldPermissionsUrl(profileId: string, tableName: string): string {
    return `${profileByIdUrl(profileId)}/tables/${encodeURIComponent(tableName)}/field-permissions`;
}

function profileSaveFieldPermissionsUrl(profileId: string): string {
    return `${profileByIdUrl(profileId)}/field-permissions`;
}

export type SaveProfileFieldPermissionPayload = {
    tableName: string;
    fieldName: string;
    isMandatory: boolean;
    isReadOnly: boolean;
    isEditable: boolean;
};

/** Single field row from GET .../tables/{tableName}/field-permissions */
export type ProfileFieldPermissionItem = {
    permissionId?: string | null;
    fieldName: string;
    fieldLabel?: string;
    dataType?: string;
    isMandatory?: boolean;
    isReadOnly?: boolean;
    isEditable?: boolean;
    hasPermission?: boolean;
};

export type ProfileFieldPermissionsResult = {
    profileId?: string;
    tableName?: string;
    source?: string;
    objectDefinitionId?: string;
    fields: ProfileFieldPermissionItem[];
};

function normalizeFieldPermissionItems(value: unknown): ProfileFieldPermissionItem[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item): ProfileFieldPermissionItem | null => {
            if (typeof item === "string") {
                return { fieldName: item, fieldLabel: item };
            }
            if (!item || typeof item !== "object") {
                return null;
            }
            const record = item as Record<string, unknown>;
            const fieldName = record.fieldName ?? record.name ?? record.apiName ?? record.key;
            if (typeof fieldName !== "string" || !fieldName.trim()) {
                return null;
            }
            return {
                permissionId:
                    record.permissionId === null || record.permissionId === undefined
                        ? null
                        : String(record.permissionId),
                fieldName: fieldName.trim(),
                fieldLabel:
                    typeof record.fieldLabel === "string"
                        ? record.fieldLabel
                        : typeof record.label === "string"
                          ? record.label
                          : fieldName.trim(),
                dataType: typeof record.dataType === "string" ? record.dataType : undefined,
                isMandatory: typeof record.isMandatory === "boolean" ? record.isMandatory : false,
                isReadOnly: typeof record.isReadOnly === "boolean" ? record.isReadOnly : false,
                isEditable: typeof record.isEditable === "boolean" ? record.isEditable : true,
                hasPermission:
                    typeof record.hasPermission === "boolean" ? record.hasPermission : false,
            };
        })
        .filter((item): item is ProfileFieldPermissionItem => item !== null);
}

function unwrapFieldPermissionsPayload(body: unknown): ProfileFieldPermissionsResult {
    const empty: ProfileFieldPermissionsResult = { fields: [] };
    if (!body || typeof body !== "object") {
        return empty;
    }

    const root = body as Record<string, unknown>;
    const data = root.data;

    if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        if (Array.isArray(record.fields)) {
            return {
                profileId: typeof record.profileId === "string" ? record.profileId : undefined,
                tableName: typeof record.tableName === "string" ? record.tableName : undefined,
                source: typeof record.source === "string" ? record.source : undefined,
                objectDefinitionId:
                    typeof record.objectDefinitionId === "string"
                        ? record.objectDefinitionId
                        : undefined,
                fields: normalizeFieldPermissionItems(record.fields),
            };
        }
    }

    if (Array.isArray(root.fields)) {
        return { fields: normalizeFieldPermissionItems(root.fields) };
    }
    if (Array.isArray(body)) {
        return { fields: normalizeFieldPermissionItems(body) };
    }

    return empty;
}

function normalizeEffectivePermissionItems(value: unknown): ProfileEffectivePermissionItem[] {
    if (Array.isArray(value)) {
        return value
            .map((item): ProfileEffectivePermissionItem | null => {
                if (typeof item === "string") {
                    return { tabName: item };
                }
                if (item && typeof item === "object") {
                    return item as ProfileEffectivePermissionItem;
                }
                return null;
            })
            .filter((item): item is ProfileEffectivePermissionItem => item !== null);
    }

    if (value && typeof value === "object") {
        return Object.entries(value as Record<string, unknown>).map(([tabName, config]) => {
            if (config && typeof config === "object") {
                return { tabName, ...(config as Record<string, unknown>) };
            }
            return { tabName };
        });
    }

    return [];
}

function unwrapEffectivePermissions(body: unknown): ProfileEffectivePermissionItem[] {
    if (Array.isArray(body)) {
        return normalizeEffectivePermissionItems(body);
    }
    if (!body || typeof body !== "object") {
        return [];
    }

    const root = body as Record<string, unknown>;
    const candidates = [
        root.data,
        root.tabPermissions,
        root.tablePermissions,
        root.tabs,
        root.tables,
        root.permissions,
        root.effectivePermissions,
        root.effective,
    ];

    const collected: ProfileEffectivePermissionItem[] = [];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            collected.push(...normalizeEffectivePermissionItems(candidate));
            continue;
        }
        if (candidate && typeof candidate === "object") {
            const record = candidate as Record<string, unknown>;
            const nestedCandidates = [
                record.tabPermissions,
                record.tablePermissions,
                record.tabs,
                record.tables,
                record.permissions,
                record.effectivePermissions,
                record.effective,
            ];

            for (const nested of nestedCandidates) {
                if (Array.isArray(nested) || (nested && typeof nested === "object")) {
                    const items = normalizeEffectivePermissionItems(nested);
                    if (items.length > 0) {
                        collected.push(...items);
                    }
                }
            }

            const items = normalizeEffectivePermissionItems(candidate);
            if (items.length > 0) {
                collected.push(...items);
            }
        }
    }

    return collected;
}

/** Partial update body `{ name, description, canSetup, department }` — API expects PATCH. */
export async function updateProfile(profileId: string, payload: UpdateProfilePayload): Promise<unknown> {
    const response = await fetch(profileByIdUrl(profileId), {
        method: "PATCH",
        headers: {
            ...authHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    const text = await response.text().catch(() => "");
    if (!response.ok) {
        throw new Error(text || `Failed to update profile (${response.status})`);
    }
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return text;
    }
}

export async function deleteProfile(profileId: string): Promise<void> {
    const response = await fetch(profileByIdUrl(profileId), {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to delete profile (${response.status})`);
    }
}

export async function saveProfileTabPermission(
    profileId: string,
    payload: SaveProfileTabPermissionPayload
): Promise<unknown> {
    const response = await fetch(profileTabPermissionsUrl(profileId), {
        method: "POST",
        headers: {
            ...authHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const text = await response.text().catch(() => "");
    if (!response.ok) {
        throw new Error(text || `Failed to save tab permission (${response.status})`);
    }
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return text;
    }
}

export async function saveProfileTablePermission(
    profileId: string,
    payload: SaveProfileTablePermissionPayload
): Promise<unknown> {
    const response = await fetch(profileTablePermissionsUrl(profileId), {
        method: "POST",
        headers: {
            ...authHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const text = await response.text().catch(() => "");
    if (!response.ok) {
        throw new Error(text || `Failed to save table permission (${response.status})`);
    }
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return text;
    }
}

export async function saveProfileFieldPermission(
    profileId: string,
    payload: SaveProfileFieldPermissionPayload
): Promise<unknown> {
    const response = await fetch(profileSaveFieldPermissionsUrl(profileId), {
        method: "POST",
        headers: {
            ...authHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const text = await response.text().catch(() => "");
    if (!response.ok) {
        throw new Error(text || `Failed to save field permission (${response.status})`);
    }
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return text;
    }
}

export async function fetchProfileFieldPermissions(
    profileId: string,
    tableName: string
): Promise<ProfileFieldPermissionsResult> {
    const response = await fetch(profileFieldPermissionsUrl(profileId, tableName), {
        method: "GET",
        headers: authHeaders(),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to load field permissions (${response.status})`);
    }

    const body: unknown = await response.json().catch(() => ({}));
    return unwrapFieldPermissionsPayload(body);
}

export async function fetchProfileEffectivePermissions(
    profileId: string
): Promise<ProfileEffectivePermissionItem[]> {
    const response = await fetch(profileEffectiveUrl(profileId), {
        method: "GET",
        headers: authHeaders(),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to load effective permissions (${response.status})`);
    }

    const body: unknown = await response.json().catch(() => []);
    return unwrapEffectivePermissions(body);
}
