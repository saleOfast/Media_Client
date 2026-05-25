import type { FieldPermission, TablePermission, UserPermissions } from "../Types/auth";
import { hasVisibleTab } from "./navConfig";

export function normalizePermissionKey(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, "_");
}

/** User has field rules but no table grants (e.g. projects-only field access). */
export function hasOnlyFieldLevelAccess(permissions: UserPermissions | null): boolean {
    if (!permissions) {
        return false;
    }
    return permissions.tables.length === 0 && permissions.fields.length > 0;
}

/**
 * Profile/JWT `canSetup: true` — user may open Setup (e.g. HOD profile).
 * Blocked only for field-only restriction (no setup UI for projects-only field users).
 */
export function canAccessSetupModule(
    permissions: UserPermissions | null,
    canSetup = false
): boolean {
    if (!canSetup) {
        return false;
    }
    if (hasOnlyFieldLevelAccess(permissions)) {
        return false;
    }
    return true;
}

/**
 * Full static top nav (all modules) — not used for `canSetup` tab-only profiles like HOD.
 */
export function isSetupAdministrator(
    canSetup: boolean,
    permissions: UserPermissions | null
): boolean {
    if (!permissions) {
        return false;
    }
    if (hasVisibleTab(permissions.tabs, "setup")) {
        return true;
    }
    if (!canSetup) {
        return false;
    }
    return permissions.tables.length > 0;
}

function tablePermissionMap(permissions: UserPermissions | null): Map<string, TablePermission> {
    const map = new Map<string, TablePermission>();
    if (!permissions) {
        return map;
    }
    for (const row of permissions.tables) {
        map.set(normalizePermissionKey(row.tableName), row);
    }
    return map;
}

function resolveTablePermission(
    permissions: UserPermissions | null,
    tableName: string
): TablePermission | undefined {
    const map = tablePermissionMap(permissions);
    const key = normalizePermissionKey(tableName);
    return map.get(key);
}

function hasFieldGrantsForTable(permissions: UserPermissions | null, tableName: string): boolean {
    if (!permissions) {
        return false;
    }
    const key = normalizePermissionKey(tableName);
    return permissions.fields.some((field) => normalizePermissionKey(field.tableName) === key);
}

export function canAccessTable(
    permissions: UserPermissions | null,
    tableName: string,
    isSetupAdmin = false
): boolean {
    if (isSetupAdmin) {
        return true;
    }
    const explicit = resolveTablePermission(permissions, tableName);
    if (explicit) {
        return explicit.canRead !== false;
    }
    return hasFieldGrantsForTable(permissions, tableName);
}

export function canCreateOnTable(
    permissions: UserPermissions | null,
    tableName: string,
    isSetupAdmin = false
): boolean {
    if (isSetupAdmin) {
        return true;
    }
    const explicit = resolveTablePermission(permissions, tableName);
    if (explicit) {
        return explicit.canCreate === true || explicit.canWrite === true;
    }
    return false;
}

export function canEditOnTable(
    permissions: UserPermissions | null,
    tableName: string,
    isSetupAdmin = false
): boolean {
    if (isSetupAdmin) {
        return true;
    }
    const explicit = resolveTablePermission(permissions, tableName);
    if (explicit) {
        return explicit.canEdit === true || explicit.canWrite === true;
    }
    return hasFieldGrantsForTable(permissions, tableName);
}

export function canDeleteOnTable(
    permissions: UserPermissions | null,
    tableName: string,
    isSetupAdmin = false
): boolean {
    if (isSetupAdmin) {
        return true;
    }
    const explicit = resolveTablePermission(permissions, tableName);
    return explicit?.canDelete === true;
}

/** Setup sidebar paths -> table names */
const SETUP_TABLE_KEYS: Record<string, string[]> = {
    "/setup": ["users", "user"],
    "/setup/profile": ["profiles", "profile"],
    "/setup/role": ["roles", "role"],
    "/setup/object": ["objects", "object", "object_manager"],
};

export function canAccessSetupPath(
    permissions: UserPermissions | null,
    path: string,
    canSetup = false
): boolean {
    if (!canAccessSetupModule(permissions, canSetup)) {
        return false;
    }
    if (canSetup && !hasOnlyFieldLevelAccess(permissions)) {
        return true;
    }
    const tableKeys = SETUP_TABLE_KEYS[path];
    if (!tableKeys || !permissions) {
        return path === "/setup";
    }
    if (permissions.tables.length === 0) {
        return path === "/setup";
    }
    return tableKeys.some((name) => canAccessTable(permissions, name));
}

export function getFieldPermission(
    permissions: UserPermissions | null,
    tableName: string,
    fieldName: string
): FieldPermission | null {
    if (!permissions) {
        return null;
    }
    const tableKey = normalizePermissionKey(tableName);
    const fieldKey = normalizePermissionKey(fieldName);
    return (
        permissions.fields.find(
            (field) =>
                normalizePermissionKey(field.tableName) === tableKey &&
                normalizePermissionKey(field.fieldName) === fieldKey
        ) ?? null
    );
}

export function getAllowedFieldsForTable(
    permissions: UserPermissions | null,
    tableName: string
): FieldPermission[] {
    if (!permissions) {
        return [];
    }
    const tableKey = normalizePermissionKey(tableName);
    return permissions.fields.filter(
        (field) => normalizePermissionKey(field.tableName) === tableKey
    );
}
