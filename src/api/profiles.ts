import { API_BASE_URL } from "../config/api";
import { getToken } from "../lib/authStorage";
import type { FieldPermission, TabPermission, TablePermission, UserPermissions } from "../Types/auth";

const PROFILES_URL = `${API_BASE_URL.replace(/\/$/, "")}/profiles`;
const TAB_PERMISSIONS_CATALOG_URL = `${PROFILES_URL}/tab-permissions/catalog`;

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

export type ProfileAssignedUser = {
    id: string;
    userName: string;
};

/** Raw item from GET/POST/PATCH profile APIs */
export type ProfileApiItem = Record<string, unknown> & {
    id?: string | number;
    name?: string;
    description?: string;
    canSetup?: boolean;
    department?: string | null;
    assignedUsersCount?: number;
    assignedUsers?: ProfileAssignedUser[] | Array<Record<string, unknown>>;
    assignedUserNames?: string[];
    modifiedByName?: string;
    createdAt?: string;
    updatedAt?: string;
    permissionCacheVersion?: number;
};

export function resolveProfileAssignedUsers(item: ProfileApiItem): ProfileAssignedUser[] {
    const users = item.assignedUsers;
    if (Array.isArray(users) && users.length > 0) {
        return users
            .map((entry) => {
                if (!entry || typeof entry !== "object") {
                    return null;
                }
                const record = entry as Record<string, unknown>;
                const id = String(record.id ?? "").trim();
                const userName = String(
                    record.userName ?? record.username ?? record.name ?? ""
                ).trim();
                if (!id && !userName) {
                    return null;
                }
                return { id, userName: userName || id };
            })
            .filter((entry): entry is ProfileAssignedUser => entry !== null);
    }

    const names = item.assignedUserNames;
    if (Array.isArray(names) && names.length > 0) {
        return names
            .map((name) => {
                const userName = String(name ?? "").trim();
                if (!userName) {
                    return null;
                }
                return { id: "", userName };
            })
            .filter((entry): entry is ProfileAssignedUser => entry !== null);
    }

    return [];
}

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

function unwrapProfileItem(body: unknown): ProfileApiItem {
    if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;
        const data = record.data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
            return data as ProfileApiItem;
        }
        if (record.profile && typeof record.profile === "object" && !Array.isArray(record.profile)) {
            return record.profile as ProfileApiItem;
        }
        if (record.id || record.name) {
            return record as ProfileApiItem;
        }
    }
    return {};
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

export async function fetchProfileById(profileId: string): Promise<ProfileApiItem> {
    const response = await fetch(profileByIdUrl(profileId), {
        method: "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to load profile (${response.status})`);
    }
    const body: unknown = await response.json().catch(() => ({}));
    return unwrapProfileItem(body);
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
};

export type ProfileTabPermissionItem = {
    tabName: string;
    isVisible: boolean;
    isDefaultNav?: boolean;
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
    const data = root.data;

    if (data && typeof data === "object" && !Array.isArray(data)) {
        const record = data as Record<string, unknown>;
        const tabs = normalizeEffectivePermissionItems(record.tabs);
        const tables = normalizeEffectivePermissionItems(record.tables);
        if (tabs.length > 0 || tables.length > 0) {
            return [...tabs, ...tables];
        }
    }

    const candidates = [
        root.tabPermissions,
        root.tablePermissions,
        root.tabs,
        root.tables,
        root.permissions,
        root.effectivePermissions,
        root.effective,
        Array.isArray(data) ? data : null,
    ];

    const collected: ProfileEffectivePermissionItem[] = [];

    for (const candidate of candidates) {
        if (!candidate) {
            continue;
        }
        if (Array.isArray(candidate)) {
            collected.push(...normalizeEffectivePermissionItems(candidate));
            continue;
        }
        if (typeof candidate === "object") {
            const record = candidate as Record<string, unknown>;
            const nestedCandidates = [
                record.tabPermissions,
                record.tablePermissions,
                record.tabs,
                record.tables,
            ];
            for (const nested of nestedCandidates) {
                if (Array.isArray(nested)) {
                    collected.push(...normalizeEffectivePermissionItems(nested));
                }
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

function unwrapProfileTabPermissions(body: unknown): ProfileTabPermissionItem[] {
    const normalize = (value: unknown): ProfileTabPermissionItem[] => {
        if (!Array.isArray(value)) {
            return [];
        }
        return value
            .map((item): ProfileTabPermissionItem | null => {
                if (!item || typeof item !== "object") {
                    return null;
                }
                const record = item as Record<string, unknown>;
                const tabName = record.tabName ?? record.name ?? record.key;
                if (typeof tabName !== "string" || !tabName.trim()) {
                    return null;
                }
                return {
                    tabName: tabName.trim(),
                    isVisible:
                        typeof record.isVisible === "boolean"
                            ? record.isVisible
                            : record.visible === true || record.enabled === true,
                    isDefaultNav:
                        typeof record.isDefaultNav === "boolean"
                            ? record.isDefaultNav
                            : record.defaultOn === true || record.isDefault === true,
                };
            })
            .filter((item): item is ProfileTabPermissionItem => item !== null);
    };

    if (Array.isArray(body)) {
        return normalize(body);
    }
    if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;
        const data = record.data;
        if (Array.isArray(data)) {
            return normalize(data);
        }
        if (data && typeof data === "object") {
            const nested = data as Record<string, unknown>;
            if (Array.isArray(nested.tabPermissions)) {
                return normalize(nested.tabPermissions);
            }
            if (Array.isArray(nested.tabs)) {
                return normalize(nested.tabs);
            }
        }
        if (Array.isArray(record.tabPermissions)) {
            return normalize(record.tabPermissions);
        }
    }
    return [];
}

export async function fetchProfileTabPermissions(
    profileId: string
): Promise<ProfileTabPermissionItem[]> {
    const response = await fetch(profileTabPermissionsUrl(profileId), {
        method: "GET",
        headers: authHeaders(),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to load tab permissions (${response.status})`);
    }

    const body: unknown = await response.json().catch(() => []);
    return unwrapProfileTabPermissions(body);
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

function normalizeEffectiveTabPermission(item: unknown): TabPermission | null {
    if (!item || typeof item !== "object") {
        return null;
    }
    const record = item as Record<string, unknown>;
    const tabName = record.tabName ?? record.name;
    if (typeof tabName !== "string" || !tabName.trim()) {
        return null;
    }
    const isVisible = record.isVisible === true;
    return {
        tabName: tabName.trim(),
        tabLabel:
            typeof record.tabLabel === "string"
                ? record.tabLabel
                : typeof record.label === "string"
                  ? record.label
                  : undefined,
        isVisible,
        defaultOn: isVisible,
        isDefaultNav: record.isDefaultNav === true,
    };
}

function normalizeEffectiveTablePermission(item: unknown): TablePermission | null {
    if (!item || typeof item !== "object") {
        return null;
    }
    const record = item as Record<string, unknown>;
    const tableName = record.tableName ?? record.name;
    if (typeof tableName !== "string" || !tableName.trim()) {
        return null;
    }
    return {
        tableName: tableName.trim(),
        canRead: record.canRead === true,
        canCreate: record.canCreate === true || record.canWrite === true,
        canEdit: record.canEdit === true || record.canWrite === true,
        canDelete: record.canDelete === true,
        canWrite: record.canWrite === true,
    };
}

/** Maps GET `/profiles/:id/effective` to the same shape as login `permissions`. */
export function parseEffectivePermissionsBody(body: unknown): UserPermissions | null {
    if (!body || typeof body !== "object") {
        return null;
    }
    const root = body as Record<string, unknown>;
    const data = root.data;
    const record =
        data && typeof data === "object" && !Array.isArray(data)
            ? (data as Record<string, unknown>)
            : root;

    const tabs = Array.isArray(record.tabs)
        ? record.tabs
              .map(normalizeEffectiveTabPermission)
              .filter((item): item is TabPermission => item !== null)
        : [];
    const tables = Array.isArray(record.tables)
        ? record.tables
              .map(normalizeEffectiveTablePermission)
              .filter((item): item is TablePermission => item !== null)
        : [];

    const fields: FieldPermission[] = [];
    if (Array.isArray(record.fields)) {
        for (const raw of record.fields) {
            if (!raw || typeof raw !== "object") {
                continue;
            }
            const row = raw as Record<string, unknown>;
            const tableName = row.tableName;
            const fieldName = row.fieldName ?? row.name;
            if (typeof tableName !== "string" || typeof fieldName !== "string") {
                continue;
            }
            fields.push({
                id: typeof row.id === "string" ? row.id : undefined,
                profileId:
                    typeof row.profileId === "string" ? row.profileId : undefined,
                tableName: tableName.trim(),
                fieldName: fieldName.trim(),
                isMandatory: row.isMandatory === true,
                isReadOnly: row.isReadOnly === true,
                isEditable: row.isEditable !== false,
            });
        }
    }

    return {
        profileId: String(record.profileId ?? ""),
        cacheVersion: typeof record.cacheVersion === "number" ? record.cacheVersion : 0,
        tabs,
        tables,
        fields,
        recordTypeAccess: Array.isArray(record.recordTypeAccess) ? record.recordTypeAccess : [],
    };
}

/** Fresh permissions for the logged-in user's profile (after admin updates tab settings). */
export async function fetchProfileUserPermissions(
    profileId: string
): Promise<UserPermissions | null> {
    const response = await fetch(profileEffectiveUrl(profileId), {
        method: "GET",
        headers: authHeaders(),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to refresh permissions (${response.status})`);
    }

    const body: unknown = await response.json().catch(() => null);
    return parseEffectivePermissionsBody(body);
}
