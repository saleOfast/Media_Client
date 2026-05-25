import { Activity, Building2, PlusCircle, Shield, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type {
    ProfileApiItem,
    ProfileEffectivePermissionItem,
    ProfileFieldPermissionItem,
    ProfileTabPermissionItem,
    SaveProfileFieldPermissionPayload,
    TabPermissionCatalogItem,
} from "../../../api/profiles";
import {
    deleteProfile,
    fetchProfileEffectivePermissions,
    fetchProfileFieldPermissions,
    fetchProfileTabPermissions,
    fetchProfileUserPermissions,
    fetchProfiles,
    fetchTabPermissionsCatalog,
    saveProfileFieldPermission,
    saveProfileTabPermission,
    saveProfileTablePermission,
    updateProfile,
} from "../../../api/profiles";
import { updatePermissions } from "../../../store/authSlice";
import { store } from "../../../store";
import DynamicTable from "../../../components/DynamicTable";
import { useToast } from "../../../components/ToastProvider";
import { resolveTabRoute } from "../../../lib/navConfig";
import type { Column } from "../../../Types/Table";

export interface ProfileRow {
    id: string;
    profileName: string;
    description: string;
    users: string;
    department: string;
    modifiedBy: string;
    modifiedOn: string;
    canSetup: boolean;
}

interface TabPermissionRow {
    id: string;
    tabName: string;
    /** UI "Default On" ↔ API `isVisible` */
    defaultOn: boolean;
    description: string;
}

interface TablePermissionRow {
    tableName: string;
    read: boolean;
    write: boolean;
    edit: boolean;
    delete: boolean;
}

interface FieldPermissionRow {
    id: string;
    permissionId: string | null;
    fieldName: string;
    fieldLabel: string;
    dataType: string;
    isMandatory: boolean;
    isReadOnly: boolean;
    isEditable: boolean;
    hasPermission: boolean;
}

function mapFieldPermissionRowToSavePayload(
    row: FieldPermissionRow,
    tableName: string
): SaveProfileFieldPermissionPayload {
    return {
        tableName,
        fieldName: row.fieldName,
        isMandatory: row.isMandatory,
        isReadOnly: row.isReadOnly,
        isEditable: row.isEditable,
    };
}

function formatIsoDate(iso: unknown): string {
    if (typeof iso !== "string") {
        return "—";
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function mapApiItemToRow(item: ProfileApiItem, index: number): ProfileRow {
    const name = String(item.name ?? "");
    const id = item.id != null && String(item.id) !== "" ? String(item.id) : `profile-${index}-${name || "unnamed"}`;
    const userCount =
        typeof item.assignedUsersCount === "number"
            ? item.assignedUsersCount
            : typeof item.userCount === "number"
                ? item.userCount
                : typeof item.usersCount === "number"
                    ? item.usersCount
                    : undefined;
    const usersLabel =
        userCount !== undefined ? `${userCount} User${userCount === 1 ? "" : "s"}` : "—";

    const department =
        item.department === null || item.department === undefined || item.department === ""
            ? "—"
            : String(item.department);

    const modifiedBy = String(
        item.modifiedByName ?? item.updatedBy ?? item.modifiedBy ?? item.createdBy ?? item.created_by ?? "—"
    );
    const modifiedOn = formatIsoDate(item.updatedAt ?? item.updated_at ?? item.createdAt ?? item.created_at);

    return {
        id,
        profileName: name || "—",
        description: String(item.description ?? ""),
        users: usersLabel,
        department,
        modifiedBy,
        modifiedOn,
        canSetup: Boolean(item.canSetup),
    };
}

function getCatalogString(item: TabPermissionCatalogItem, keys: string[], fallback = ""): string {
    for (const key of keys) {
        const value = item[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
        if (typeof value === "number") {
            return String(value);
        }
    }
    return fallback;
}

function getCatalogBoolean(item: TabPermissionCatalogItem, keys: string[], fallback = false): boolean {
    for (const key of keys) {
        const value = item[key];
        if (typeof value === "boolean") {
            return value;
        }
    }
    return fallback;
}

function mapCatalogItemToRow(item: TabPermissionCatalogItem, index: number): TabPermissionRow {
    const tabName = getCatalogString(
        item,
        ["tabName", "tableName", "key", "name", "navigationItem"],
        `Tab ${index + 1}`
    );

    return {
        id: getCatalogString(item, ["id", "key", "tabName", "tableName", "name"], `tab-${index}`),
        tabName,
        defaultOn: getCatalogBoolean(item, ["isVisible", "visible", "defaultOn", "enabled"], true),
        description: getCatalogString(
            item,
            ["description", "helpText", "summary", "label", "displayName"],
            "—"
        ),
    };
}

function resolveSavedTabPermission(
    savedByTab: Map<string, ProfileTabPermissionItem>,
    tabName: string
): ProfileTabPermissionItem | undefined {
    const key = normalizePermissionKey(tabName);
    if (savedByTab.has(key)) {
        return savedByTab.get(key);
    }
    const withoutSuffix = key.replace(/__c$/, "");
    if (withoutSuffix && savedByTab.has(withoutSuffix)) {
        return savedByTab.get(withoutSuffix);
    }
    if (!key.endsWith("__c") && savedByTab.has(`${key}__c`)) {
        return savedByTab.get(`${key}__c`);
    }
    return undefined;
}

function applyProfileTabPermissions(
    rows: TabPermissionRow[],
    savedItems: ProfileTabPermissionItem[]
): TabPermissionRow[] {
    const savedByTab = new Map<string, ProfileTabPermissionItem>();
    savedItems.forEach((item) => {
        savedByTab.set(normalizePermissionKey(item.tabName), item);
    });

    return rows.map((row) => {
        const saved = resolveSavedTabPermission(savedByTab, row.tabName);
        if (!saved) {
            return row;
        }
        return {
            ...row,
            defaultOn: saved.isVisible,
        };
    });
}

function mapFieldPermissionItem(item: ProfileFieldPermissionItem): FieldPermissionRow {
    const permissionId =
        item.permissionId === null || item.permissionId === undefined
            ? null
            : String(item.permissionId);
    return {
        id: permissionId ?? item.fieldName,
        permissionId,
        fieldName: item.fieldName,
        fieldLabel: item.fieldLabel ?? item.fieldName,
        dataType: item.dataType ?? "—",
        isMandatory: Boolean(item.isMandatory),
        isReadOnly: Boolean(item.isReadOnly),
        isEditable: item.isEditable !== false,
        hasPermission: Boolean(item.hasPermission),
    };
}

function mapCatalogItemToTableRow(item: TabPermissionCatalogItem, index: number): TablePermissionRow {
    const tableName = getCatalogString(
        item,
        ["tableName", "objectName", "tabName", "name", "label", "displayName", "navigationItem", "key"],
        `Table ${index + 1}`
    );

    return {
        tableName,
        read: getCatalogBoolean(item, ["canRead", "read"], true),
        write: getCatalogBoolean(item, ["canCreate", "canWrite", "write"], true),
        edit: getCatalogBoolean(item, ["canEdit", "edit"], true),
        delete: getCatalogBoolean(item, ["canDelete", "delete"], false),
    };
}

function normalizePermissionKey(value: string): string {
    return value.trim().toLowerCase();
}

function getTabNameFromCatalogItem(item: TabPermissionCatalogItem): string {
    return getCatalogString(item, ["tabName", "tableName", "key", "name", "navigationItem"], "");
}

/** Catalog returns pairs like `account` + `account__c` — keep one row per tab (prefer `__c`). */
function deduplicateTabCatalogItems(items: TabPermissionCatalogItem[]): TabPermissionCatalogItem[] {
    const byBase = new Map<string, TabPermissionCatalogItem>();

    for (const item of items) {
        const tabName = getTabNameFromCatalogItem(item);
        if (!tabName) {
            continue;
        }
        const baseKey = normalizePermissionKey(tabName).replace(/__c$/, "");
        const existing = byBase.get(baseKey);
        if (!existing) {
            byBase.set(baseKey, item);
            continue;
        }
        const existingName = getTabNameFromCatalogItem(existing);
        if (
            normalizePermissionKey(tabName).endsWith("__c") &&
            !normalizePermissionKey(existingName).endsWith("__c")
        ) {
            byBase.set(baseKey, item);
        }
    }

    return Array.from(byBase.values()).sort((a, b) => {
        const nameA = getTabNameFromCatalogItem(a);
        const nameB = getTabNameFromCatalogItem(b);
        const orderA = resolveTabRoute(nameA)?.order ?? 99;
        const orderB = resolveTabRoute(nameB)?.order ?? 99;
        return orderA - orderB || nameA.localeCompare(nameB);
    });
}

function sortTabPermissionRows(rows: TabPermissionRow[]): TabPermissionRow[] {
    return [...rows].sort((a, b) => {
        const orderA = resolveTabRoute(a.tabName)?.order ?? 99;
        const orderB = resolveTabRoute(b.tabName)?.order ?? 99;
        return orderA - orderB || a.tabName.localeCompare(b.tabName);
    });
}

function getTabDisplayLabel(tabName: string): string {
    return resolveTabRoute(tabName)?.label ?? tabName;
}

function applyTableEffectivePermissions(
    rows: TablePermissionRow[],
    effectiveItems: ProfileEffectivePermissionItem[]
): TablePermissionRow[] {
    const effectiveByTable = new Map<string, ProfileEffectivePermissionItem>();

    effectiveItems.forEach((item) => {
        const tableName = getCatalogString(item, ["tableName", "objectName", "name", "key", "tabName"]);
        if (tableName) {
            effectiveByTable.set(normalizePermissionKey(tableName), item);
        }
    });

    return rows.map((row) => {
        const effective = effectiveByTable.get(normalizePermissionKey(row.tableName));
        if (!effective) {
            return row;
        }

        return {
            ...row,
            read: getCatalogBoolean(effective, ["canRead", "read", "isRead"], row.read),
            write: getCatalogBoolean(effective, ["canCreate", "canWrite", "write", "isWrite"], row.write),
            edit: getCatalogBoolean(effective, ["canEdit", "edit", "canUpdate", "update", "isEdit"], row.edit),
            delete: getCatalogBoolean(
                effective,
                ["canDelete", "delete", "canRemove", "remove", "isDelete"],
                row.delete
            ),
        };
    });
}

const ProfileSetting = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("all-profiles");
    const [profiles, setProfiles] = useState<ProfileRow[]>([]);
    const [selectedProfile, setSelectedProfile] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [tabPermissionRows, setTabPermissionRows] = useState<TabPermissionRow[]>([]);
    const [tabPermissionLoading, setTabPermissionLoading] = useState(false);
    const [tabPermissionError, setTabPermissionError] = useState<string | null>(null);
    const [tabPermissionCatalogLoaded, setTabPermissionCatalogLoaded] = useState(false);
    const [tabPermissionSaving, setTabPermissionSaving] = useState(false);
    const [tabPermissionSyncing, setTabPermissionSyncing] = useState(false);
    const [tabPermissionEffectiveProfileId, setTabPermissionEffectiveProfileId] = useState("");
    const [tablePermissionRows, setTablePermissionRows] = useState<TablePermissionRow[]>([]);
    const [tablePermissionSaving, setTablePermissionSaving] = useState(false);
    const [tablePermissionError, setTablePermissionError] = useState<string | null>(null);
    const [tablePermissionEffectiveProfileId, setTablePermissionEffectiveProfileId] = useState("");
    const [selectedFieldTable, setSelectedFieldTable] = useState("");
    const [fieldPermissionRows, setFieldPermissionRows] = useState<FieldPermissionRow[]>([]);
    const [fieldPermissionMeta, setFieldPermissionMeta] = useState<{
        tableName?: string;
        source?: string;
    } | null>(null);
    const [fieldPermissionLoading, setFieldPermissionLoading] = useState(false);
    const [fieldPermissionSaving, setFieldPermissionSaving] = useState(false);
    const [fieldPermissionError, setFieldPermissionError] = useState<string | null>(null);

    const [editingProfile, setEditingProfile] = useState<ProfileRow | null>(null);
    const [editName, setEditName] = useState("");
    const [editDepartment, setEditDepartment] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editCanSetup, setEditCanSetup] = useState(false);
    const [editSaving, setEditSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<ProfileRow | null>(null);
    const [deleteSaving, setDeleteSaving] = useState(false);

    const [modalError, setModalError] = useState<string | null>(null);

    const loadProfiles = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const items = await fetchProfiles();
            const rows = items.map((item, index) => mapApiItemToRow(item, index));
            setProfiles(rows);
            setSelectedProfile((previous) => {
                if (rows.some((row) => row.id === previous)) {
                    return previous;
                }
                return rows[0]?.id ?? "";
            });
        } catch (error) {
            setLoadError(error instanceof Error ? error.message : "Failed to load profiles");
            setProfiles([]);
            setSelectedProfile("");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadProfiles();
    }, [loadProfiles]);

    const loadTabPermissionsCatalog = useCallback(async () => {
        setTabPermissionCatalogLoaded(true);
        setTabPermissionLoading(true);
        setTabPermissionError(null);
        setTablePermissionError(null);
        try {
            const items = await fetchTabPermissionsCatalog();
            const dedupedTabs = deduplicateTabCatalogItems(items);
            const tableRows = items.map((item, index) => mapCatalogItemToTableRow(item, index));
            setTabPermissionRows(
                sortTabPermissionRows(
                    dedupedTabs.map((item, index) => mapCatalogItemToRow(item, index))
                )
            );
            setTablePermissionRows(tableRows);
            setTabPermissionEffectiveProfileId("");
            setTablePermissionEffectiveProfileId("");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to load tab permissions catalog";
            setTabPermissionRows([]);
            setTablePermissionRows([]);
            setTabPermissionError(message);
            setTablePermissionError(message);
        } finally {
            setTabPermissionLoading(false);
        }
    }, []);

    const loadProfileFieldPermissions = useCallback(async (profileId: string, tableName: string) => {
        if (!profileId || !tableName) {
            setFieldPermissionRows([]);
            setFieldPermissionMeta(null);
            return;
        }

        setFieldPermissionLoading(true);
        setFieldPermissionError(null);
        setFieldPermissionRows([]);
        try {
            const result = await fetchProfileFieldPermissions(profileId, tableName);
            setFieldPermissionRows(result.fields.map((item) => mapFieldPermissionItem(item)));
            setFieldPermissionMeta({
                tableName: result.tableName ?? tableName,
                source: result.source,
            });
        } catch (error) {
            setFieldPermissionRows([]);
            setFieldPermissionMeta(null);
            setFieldPermissionError(
                error instanceof Error ? error.message : "Failed to load field permissions"
            );
        } finally {
            setFieldPermissionLoading(false);
        }
    }, []);

    const loadProfileTabPermissionsForProfile = useCallback(async (profileId: string) => {
        if (!profileId) {
            return;
        }

        setTabPermissionSyncing(true);
        setTabPermissionError(null);
        try {
            const savedItems = await fetchProfileTabPermissions(profileId);
            setTabPermissionRows((current) =>
                sortTabPermissionRows(applyProfileTabPermissions(current, savedItems))
            );
            setTabPermissionEffectiveProfileId(profileId);
        } catch (error) {
            setTabPermissionError(
                error instanceof Error ? error.message : "Failed to load tab permissions"
            );
        } finally {
            setTabPermissionSyncing(false);
        }
    }, []);

    const loadProfileEffectivePermissions = useCallback(
        async (profileId: string, scope: "tab" | "table" | "both" = "both") => {
            if (!profileId) {
                return;
            }

            setTabPermissionSyncing(true);
            if (scope === "tab" || scope === "both") {
                setTabPermissionError(null);
            }
            if (scope === "table" || scope === "both") {
                setTablePermissionError(null);
            }
            try {
                if (scope === "tab" || scope === "both") {
                    const savedItems = await fetchProfileTabPermissions(profileId);
                    setTabPermissionRows((current) =>
                        sortTabPermissionRows(applyProfileTabPermissions(current, savedItems))
                    );
                    setTabPermissionEffectiveProfileId(profileId);
                }
                if (scope === "table" || scope === "both") {
                    const effectiveItems = await fetchProfileEffectivePermissions(profileId);
                    setTablePermissionRows((current) =>
                        applyTableEffectivePermissions(current, effectiveItems)
                    );
                    setTablePermissionEffectiveProfileId(profileId);
                }
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Failed to load permissions";
                if (scope === "tab" || scope === "both") {
                    setTabPermissionError(message);
                }
                if (scope === "table" || scope === "both") {
                    setTablePermissionError(message);
                }
            } finally {
                setTabPermissionSyncing(false);
            }
        },
        []
    );

    useEffect(() => {
        if (
            (activeTab === "tab-permissions" ||
                activeTab === "table-permissions" ||
                activeTab === "field-permissions") &&
            !tabPermissionCatalogLoaded &&
            !tabPermissionLoading
        ) {
            void loadTabPermissionsCatalog();
        }
    }, [activeTab, loadTabPermissionsCatalog, tabPermissionCatalogLoaded, tabPermissionLoading]);

    useEffect(() => {
        if (activeTab !== "tab-permissions" || !selectedProfile || tabPermissionSyncing) {
            return;
        }
        if (tabPermissionEffectiveProfileId !== selectedProfile) {
            void loadProfileTabPermissionsForProfile(selectedProfile);
        }
    }, [
        activeTab,
        loadProfileTabPermissionsForProfile,
        selectedProfile,
        tabPermissionEffectiveProfileId,
        tabPermissionSyncing,
    ]);

    useEffect(() => {
        if (activeTab !== "table-permissions" || !selectedProfile || tabPermissionSyncing) {
            return;
        }
        if (tablePermissionEffectiveProfileId !== selectedProfile) {
            void loadProfileEffectivePermissions(selectedProfile, "table");
        }
    }, [
        activeTab,
        loadProfileEffectivePermissions,
        selectedProfile,
        tablePermissionEffectiveProfileId,
        tabPermissionSyncing,
    ]);

    const updateTabPermissionRow = useCallback(
        (
            rowId: string,
            updates: Partial<Pick<TabPermissionRow, "defaultOn">>
        ) => {
            setTabPermissionRows((current) =>
                current.map((row) => (row.id === rowId ? { ...row, ...updates } : row))
            );
        },
        []
    );

    const updateTablePermissionRow = useCallback(
        (
            tableName: string,
            permission: keyof Omit<TablePermissionRow, "tableName">,
            checked: boolean
        ) => {
            setTablePermissionRows((current) =>
                current.map((row) =>
                    row.tableName === tableName ? { ...row, [permission]: checked } : row
                )
            );
        },
        []
    );

    const updateFieldPermissionRow = useCallback(
        (
            rowId: string,
            permission: keyof Pick<
                FieldPermissionRow,
                "isMandatory" | "isReadOnly" | "isEditable" | "hasPermission"
            >,
            checked: boolean
        ) => {
            setFieldPermissionRows((current) =>
                current.map((row) => (row.id === rowId ? { ...row, [permission]: checked } : row))
            );
        },
        []
    );

    const saveFieldPermissions = async () => {
        if (!selectedProfile) {
            setFieldPermissionError("Please select a profile before saving field permissions.");
            return;
        }
        if (!selectedFieldTable) {
            setFieldPermissionError("Please select a table before saving field permissions.");
            return;
        }
        if (fieldPermissionRows.length === 0) {
            setFieldPermissionError("No field permissions to save.");
            return;
        }

        setFieldPermissionSaving(true);
        setFieldPermissionError(null);
        try {
            const tableName = fieldPermissionMeta?.tableName ?? selectedFieldTable;
            await Promise.all(
                fieldPermissionRows.map((row) =>
                    saveProfileFieldPermission(
                        selectedProfile,
                        mapFieldPermissionRowToSavePayload(row, tableName)
                    )
                )
            );
            await loadProfileFieldPermissions(selectedProfile, selectedFieldTable);
            showToast("Field permissions saved successfully");
        } catch (error) {
            setFieldPermissionError(
                error instanceof Error ? error.message : "Failed to save field permissions"
            );
        } finally {
            setFieldPermissionSaving(false);
        }
    };

    const setAllTablePermissions = useCallback((checked: boolean) => {
        setTablePermissionRows((current) =>
            current.map((row) => ({
                ...row,
                read: checked,
                write: checked,
                edit: checked,
                delete: checked,
            }))
        );
    }, []);

    const saveTablePermissions = async () => {
        if (!selectedProfile) {
            setTablePermissionError("Please select a profile before saving table permissions.");
            return;
        }

        setTablePermissionSaving(true);
        setTablePermissionError(null);
        try {
            await Promise.all(
                tablePermissionRows.map((row) =>
                    saveProfileTablePermission(selectedProfile, {
                        tableName: row.tableName,
                        canRead: row.read,
                        canCreate: row.write,
                        canEdit: row.edit,
                        canDelete: row.delete,
                    })
                )
            );
            await loadProfileEffectivePermissions(selectedProfile, "table");
            showToast("Table permissions updated successfully");
        } catch (error) {
            setTablePermissionError(error instanceof Error ? error.message : "Failed to save table permissions");
        } finally {
            setTablePermissionSaving(false);
        }
    };

    const submitTabPermissions = async () => {
        if (!selectedProfile) {
            setTabPermissionError("Please select a profile before saving tab permissions.");
            return;
        }

        if (tabPermissionRows.length === 0) {
            setTabPermissionError("No tab permission rows to save.");
            return;
        }

        setTabPermissionSaving(true);
        setTabPermissionError(null);
        try {
            await Promise.all(
                tabPermissionRows.map((row) =>
                    saveProfileTabPermission(selectedProfile, {
                        tabName: row.tabName,
                        isVisible: row.defaultOn,
                    })
                )
            );
            await loadProfileTabPermissionsForProfile(selectedProfile);

            const currentProfileId = store.getState().auth.user?.profileId;
            if (currentProfileId && currentProfileId === selectedProfile) {
                const fresh = await fetchProfileUserPermissions(selectedProfile);
                if (fresh) {
                    store.dispatch(updatePermissions(fresh));
                }
                showToast("Tab permissions saved. Your navigation has been updated.");
            } else {
                showToast(
                    "Tab permissions saved. Assigned users must log out and log in again to see changes."
                );
            }
        } catch (error) {
            setTabPermissionError(error instanceof Error ? error.message : "Failed to save tab permissions");
        } finally {
            setTabPermissionSaving(false);
        }
    };

    const openEdit = useCallback((row: ProfileRow) => {
        setModalError(null);
        setEditingProfile(row);
        setEditName(row.profileName === "—" ? "" : row.profileName);
        setEditDepartment(row.department === "—" ? "" : row.department);
        setEditDescription(row.description);
        setEditCanSetup(row.canSetup);
    }, []);

    useEffect(() => {
        const editProfileId = (location.state as { editProfileId?: string } | null)?.editProfileId;
        if (!editProfileId || profiles.length === 0) {
            return;
        }
        const row = profiles.find((profile) => profile.id === editProfileId);
        if (row) {
            openEdit(row);
            navigate("/setup/profile", { replace: true, state: {} });
        }
    }, [location.state, navigate, openEdit, profiles]);

    const closeEdit = useCallback(() => {
        setEditingProfile(null);
        setModalError(null);
    }, []);

    const submitEdit = async () => {
        if (!editingProfile) {
            return;
        }
        if (!editName.trim()) {
            setModalError("Name is required.");
            return;
        }
        setModalError(null);
        setEditSaving(true);
        try {
            await updateProfile(editingProfile.id, {
                name: editName.trim(),
                description: editDescription.trim(),
                canSetup: editCanSetup,
                department: editDepartment.trim(),
            });
            closeEdit();
            showToast("Profile updated successfully");
            await loadProfiles();
        } catch (error) {
            setModalError(error instanceof Error ? error.message : "Update failed");
        } finally {
            setEditSaving(false);
        }
    };

    const submitDelete = async () => {
        if (!deleteTarget) {
            return;
        }
        setModalError(null);
        setDeleteSaving(true);
        try {
            await deleteProfile(deleteTarget.id);
            setDeleteTarget(null);
            showToast("Profile deleted successfully");
            await loadProfiles();
        } catch (error) {
            setModalError(error instanceof Error ? error.message : "Delete failed");
        } finally {
            setDeleteSaving(false);
        }
    };

    const profileColumns: Column<ProfileRow>[] = useMemo(
        () => [
            {
                title: "Profile Name",
                dataIndex: "profileName",
                render: (value, row) => (
                    <button
                        type="button"
                        className="text-left font-medium text-blue-700 hover:underline"
                        onClick={() => navigate(`/setup/profile/${row.id}`)}
                    >
                        {String(value)}
                    </button>
                ),
            },
            { title: "Description", dataIndex: "description" },
            { title: "Users", dataIndex: "users" },
            { title: "Department", dataIndex: "department" },
            {
                title: "Can setup",
                dataIndex: "canSetup",
                render: (value) => <span className="text-[11px]">{value ? "Yes" : "No"}</span>,
            },
            { title: "Modified By", dataIndex: "modifiedBy" },
            { title: "Modified On", dataIndex: "modifiedOn" },
            {
                title: "Actions",
                render: (_value, row) => (
                    <span className="inline-flex flex-wrap items-center gap-1 text-[11px]">
                        <button
                            type="button"
                            className="text-blue-700 hover:underline"
                            onClick={() => navigate(`/setup/profile/${row.id}`)}
                        >
                            View
                        </button>
                        <span className="text-black/30">|</span>
                        <button
                            type="button"
                            className="text-blue-700 hover:underline"
                            onClick={() => openEdit(row)}
                        >
                            Edit
                        </button>
                        <span className="text-black/30">|</span>
                        <button
                            type="button"
                            className="text-red-700 hover:underline"
                            onClick={() => {
                                setModalError(null);
                                setDeleteTarget(row);
                            }}
                        >
                            Delete
                        </button>
                    </span>
                ),
            },
        ],
        [navigate, openEdit]
    );

    const totalProfiles = profiles.length;
    const totalUsers = useMemo(
        () =>
            profiles.reduce((sum, profile) => {
                const match = /^(\d+)/.exec(profile.users);
                const count = match ? Number.parseInt(match[1], 10) : Number.NaN;
                return sum + (Number.isNaN(count) ? 0 : count);
            }, 0),
        [profiles]
    );
    const salesProfiles = useMemo(
        () => profiles.filter((profile) => profile.department === "Sales").length,
        [profiles]
    );
    const systemProfiles = useMemo(
        () => profiles.filter((profile) => profile.modifiedBy === "System").length,
        [profiles]
    );
    const selectedProfileName =
        profiles.find((profile) => profile.id === selectedProfile)?.profileName ?? "";

    return (
        <div className="h-full min-h-0 overflow-y-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-[16px] font-semibold text-slate-800 tracking-wide">Profile Management</p>
                    <p className="text-[11px] text-slate-500">
                        Manage profiles, permissions, and access templates.
                    </p>
                </div>
                <button
                    className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
                    onClick={() => navigate("/setup/profile/create")}
                >
                    <span className="inline-flex items-center gap-1">
                        <PlusCircle size={12} />
                        Create
                    </span>
                </button>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 text-[11px]">
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1.5 h-10">
                    <div className="flex items-center gap-1 text-slate-500 text-xs leading-none">
                        <Shield size={12} />
                        <span>Total Profiles</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-none">{totalProfiles}</p>
                </div>

                <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 h-10">
                    <div className="flex items-center gap-1 text-blue-700 text-xs leading-none">
                        <Users size={12} />
                        <span>Total Users</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-700 leading-none">{totalUsers}</p>
                </div>

                <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 h-10">
                    <div className="flex items-center gap-1 text-emerald-700 text-xs leading-none">
                        <Building2 size={12} />
                        <span>Sales Profiles</span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-700 leading-none">{salesProfiles}</p>
                </div>

                <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 h-10">
                    <div className="flex items-center gap-1 text-amber-700 text-xs leading-none">
                        <Activity size={12} />
                        <span>System Owned</span>
                    </div>
                    <p className="text-sm font-semibold text-amber-700 leading-none">{systemProfiles}</p>
                </div>
            </div>
            <div className="flex gap-1 mt-2">
                <button
                    className={`border rounded p-1 text-[11px] ${activeTab === "all-profiles" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white"}`}
                    onClick={() => setActiveTab("all-profiles")}
                >
                    All Profiles
                </button>
                <button
                    className={`border rounded p-1 text-[11px] ${activeTab === "tab-permissions" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white"}`}
                    onClick={() => setActiveTab("tab-permissions")}
                >
                    Tab Permissions
                </button>
                <button
                    className={`border rounded p-1 text-[11px] ${activeTab === "table-permissions" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white"}`}
                    onClick={() => setActiveTab("table-permissions")}
                >
                    Table Permissions
                </button>
                <button
                    className={`border rounded p-1 text-[11px] ${activeTab === "record-type-access" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white"}`}
                    onClick={() => setActiveTab("record-type-access")}
                >
                    Record Type Access
                </button>
                <button
                    className={`border rounded p-1 text-[11px] ${activeTab === "field-permissions" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white"}`}
                    onClick={() => setActiveTab("field-permissions")}
                >
                    Field Permissions
                </button>

            </div>

            {activeTab === "all-profiles" ? (
                <div className="mt-0">
                    {loadError ? (
                        <p className="mt-2 text-[11px] text-red-600">{loadError}</p>
                    ) : null}
                    <DynamicTable<ProfileRow>
                        columns={profileColumns}
                        data={profiles}
                        rowKey="id"
                        loading={loading}
                        emptyText="No profiles returned from API"
                    />
                </div>
            ) : (
                <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
                    {activeTab === "tab-permissions" && (
                        <div>
                            <div className="flex gap-1.5 items-center align-center">
                                <p className="text-[12px] font-semibold text-slate-800">
                                    Profile:
                                    <select
                                        className="ml-2 border border-slate-300 rounded px-2 py-[2px] text-[11px] text-black bg-white"
                                        value={selectedProfile}
                                        onChange={(event) => setSelectedProfile(event.target.value)}
                                    >
                                        {profiles.map((profile) => (
                                            <option key={profile.id} value={profile.id}>
                                                {profile.profileName}
                                            </option>
                                        ))}
                                    </select>
                                </p>

                                <div className=" flex items-center gap-2">
                                    <button type="button" className="text-[11px] px-1.5 py-1 border   rounded hover:bg-emerald-50 cursor-pointer">
                                        Grant All
                                    </button>
                                    <button type="button" className="text-[11px] px-2.5 py-1 border rounded hover:bg-red-50 cursor-pointer">
                                        Revoke All
                                    </button>
                                    <button
                                        type="button"
                                        className="text-[11px] px-2.5 py-1 border rounded hover:bg-slate-50 cursor-pointer disabled:opacity-60"
                                        onClick={() => void loadTabPermissionsCatalog()}
                                        disabled={tabPermissionLoading}
                                    >
                                        {tabPermissionLoading ? "Loading..." : "Refresh Catalog"}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 border border-slate-200 rounded overflow-hidden">
                                <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-200">
                                    <p className="text-[12px] font-semibold text-slate-800">
                                        Tab Permissions — {selectedProfileName || "—"}
                                    </p>
                                    <p className="text-[10px] text-slate-500">Changes take effect on user&apos;s next login</p>
                                </div>

                                <table className="w-full text-[11px]">
                                    <thead className="bg-slate-100/60">
                                        <tr>
                                            <th className="px-2 py-1 text-left">Tab / Navigation Item</th>
                                            <th className="px-2 py-1 text-center">Default On</th>
                                            <th className="px-2 py-1 text-left">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tabPermissionLoading ? (
                                            <tr className="border-t border-slate-100">
                                                <td colSpan={3} className="px-2 py-4 text-center text-slate-500">
                                                    Loading tab permissions catalog...
                                                </td>
                                            </tr>
                                        ) : tabPermissionError ? (
                                            <tr className="border-t border-slate-100">
                                                <td colSpan={3} className="px-2 py-4 text-center text-red-600">
                                                    {tabPermissionError}
                                                </td>
                                            </tr>
                                        ) : tabPermissionRows.length > 0 ? (
                                            tabPermissionRows.map((row) => (
                                                <tr key={row.id} className="border-t border-slate-100">
                                                    <td className="px-2 py-1 font-medium">
                                                        {getTabDisplayLabel(row.tabName)}
                                                    </td>

                                                    <td className="px-2 py-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="block mx-auto"
                                                            checked={row.defaultOn}
                                                            onChange={(event) =>
                                                                updateTabPermissionRow(row.id, {
                                                                    defaultOn: event.target.checked,
                                                                })
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1 text-slate-600">{row.description}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="border-t border-slate-100">
                                                <td colSpan={3} className="px-2 py-4 text-center text-slate-500">
                                                    No tab permission catalog items returned from API.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-2 flex justify-end">
                                <button
                                    type="button"
                                    className="text-[11px] px-2.5 py-1 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-60"
                                    onClick={() => void submitTabPermissions()}
                                    disabled={tabPermissionSaving || tabPermissionLoading}
                                >
                                    {tabPermissionSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "table-permissions" && (
                        <div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <p className="text-[12px] font-semibold text-slate-800">
                                    Profile:
                                    <select
                                        className="ml-2 border border-slate-300 rounded px-2 py-[2px] text-[11px] text-black bg-white"
                                        value={selectedProfile}
                                        onChange={(event) => setSelectedProfile(event.target.value)}
                                    >
                                        {profiles.map((profile) => (
                                            <option key={profile.id} value={profile.id}>
                                                {profile.profileName}
                                            </option>
                                        ))}
                                    </select>
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="text-[11px] px-1.5 py-1 border rounded hover:bg-emerald-50 cursor-pointer"
                                        onClick={() => setAllTablePermissions(true)}
                                    >
                                        Grant All
                                    </button>
                                    <button
                                        type="button"
                                        className="text-[11px] px-2.5 py-1 border rounded hover:bg-red-50"
                                        onClick={() => setAllTablePermissions(false)}
                                    >
                                        Revoke All
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 border border-slate-200 rounded overflow-hidden">
                                <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-200">
                                    <p className="text-[12px] font-semibold text-slate-800">
                                        Table Permissions — {selectedProfileName || "—"}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                        Changes take effect on user&apos;s next login
                                    </p>
                                </div>

                                <table className="w-full text-[11px]">
                                    <thead className="bg-slate-100/60">
                                        <tr>
                                            <th className="px-2 py-1 text-left">Table</th>
                                            <th className="px-2 py-1 text-center">Read</th>
                                            <th className="px-2 py-1 text-center">Create</th>
                                            <th className="px-2 py-1 text-center">Edit</th>
                                            <th className="px-2 py-1 text-center">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tabPermissionLoading ? (
                                            <tr className="border-t border-slate-100">
                                                <td colSpan={5} className="px-2 py-4 text-center text-slate-500">
                                                    Loading table permission catalog...
                                                </td>
                                            </tr>
                                        ) : tablePermissionError ? (
                                            <tr className="border-t border-slate-100">
                                                <td colSpan={5} className="px-2 py-4 text-center text-red-600">
                                                    {tablePermissionError}
                                                </td>
                                            </tr>
                                        ) : tablePermissionRows.length > 0 ? (
                                            tablePermissionRows.map((row) => (
                                                <tr key={row.tableName} className="border-t border-slate-100">
                                                    <td className="px-2 py-1 font-medium">{row.tableName}</td>
                                                    <td className="px-2 py-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="block mx-auto"
                                                            checked={row.read}
                                                            onChange={(event) =>
                                                                updateTablePermissionRow(
                                                                    row.tableName,
                                                                    "read",
                                                                    event.target.checked
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="block mx-auto"
                                                            checked={row.write}
                                                            onChange={(event) =>
                                                                updateTablePermissionRow(
                                                                    row.tableName,
                                                                    "write",
                                                                    event.target.checked
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="block mx-auto"
                                                            checked={row.edit}
                                                            onChange={(event) =>
                                                                updateTablePermissionRow(
                                                                    row.tableName,
                                                                    "edit",
                                                                    event.target.checked
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="block mx-auto"
                                                            checked={row.delete}
                                                            onChange={(event) =>
                                                                updateTablePermissionRow(
                                                                    row.tableName,
                                                                    "delete",
                                                                    event.target.checked
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="border-t border-slate-100">
                                                <td colSpan={5} className="px-2 py-4 text-center text-slate-500">
                                                    No table permission catalog items returned from API.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-2 flex justify-end">
                                <button
                                    type="button"
                                    className="text-[11px] px-2.5 py-1 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-60"
                                    onClick={() => void saveTablePermissions()}
                                    disabled={tablePermissionSaving || tabPermissionLoading}
                                >
                                    {tablePermissionSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "field-permissions" && (
                        <div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <div className="flex gap-1.5 items-center align-center">
                                    <p className="text-[12px] font-semibold text-slate-800">
                                        Profile:
                                        <select
                                            className="ml-2 border border-slate-300 rounded px-2 py-[2px] text-[11px] text-black bg-white"
                                            value={selectedProfile}
                                            onChange={(event) => {
                                                setSelectedProfile(event.target.value);
                                                setSelectedFieldTable("");
                                                setFieldPermissionRows([]);
                                                setFieldPermissionMeta(null);
                                                setFieldPermissionError(null);
                                            }}
                                        >
                                            {profiles.map((profile) => (
                                                <option key={profile.id} value={profile.id}>
                                                    {profile.profileName}
                                                </option>
                                            ))}
                                        </select>
                                    </p>
                                </div>
                                <div className="flex gap-1.5 items-center align-center">
                                    <p className="text-[12px] font-semibold text-slate-800">
                                        Table:
                                        <select
                                            className="ml-2 border border-slate-300 rounded px-2 py-[2px] text-[11px] text-black bg-white"
                                            value={selectedFieldTable}
                                            onChange={(event) => {
                                                const tableName = event.target.value;
                                                setSelectedFieldTable(tableName);
                                                setFieldPermissionRows([]);
                                                setFieldPermissionMeta(null);
                                                setFieldPermissionError(null);
                                                if (selectedProfile && tableName) {
                                                    void loadProfileFieldPermissions(
                                                        selectedProfile,
                                                        tableName
                                                    );
                                                }
                                            }}
                                            disabled={
                                                !selectedProfile ||
                                                tabPermissionLoading ||
                                                tablePermissionRows.length === 0
                                            }
                                        >
                                            <option value="">Select table</option>
                                            {tablePermissionRows.length === 0 ? (
                                                <option value="" disabled>
                                                    No tables in catalog
                                                </option>
                                            ) : (
                                                tablePermissionRows.map((row) => (
                                                    <option key={row.tableName} value={row.tableName}>
                                                        {row.tableName}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* <button
                                        type="button"
                                        className="text-[11px] px-1.5 py-1 border rounded hover:bg-emerald-50 cursor-pointer disabled:opacity-60"
                                        onClick={() => setAllFieldPermissions("hasPermission", true)}
                                        disabled={fieldPermissionRows.length === 0}
                                    >
                                        Grant All
                                    </button> */}
                                    {/* <button
                                        type="button"
                                        className="text-[11px] px-2.5 py-1 border rounded hover:bg-red-50 disabled:opacity-60"
                                        onClick={() => setAllFieldPermissions("hasPermission", false)}
                                        disabled={fieldPermissionRows.length === 0}
                                    >
                                        Revoke All
                                    </button> */}
                                    {/* <button
                                        type="button"
                                        className="text-[11px] px-2.5 py-1 border rounded hover:bg-slate-50 cursor-pointer disabled:opacity-60"
                                        onClick={() => void loadTabPermissionsCatalog()}
                                        disabled={tabPermissionLoading}
                                    >
                                        {tabPermissionLoading ? "Loading..." : "Refresh Tables"}
                                    </button> */}
                                    {/* <button
                                        type="button"
                                        className="text-[11px] px-2.5 py-1 border rounded hover:bg-slate-50 cursor-pointer disabled:opacity-60"
                                        onClick={() =>
                                            void loadProfileFieldPermissions(
                                                selectedProfile,
                                                selectedFieldTable
                                            )
                                        }
                                        disabled={
                                            fieldPermissionLoading ||
                                            !selectedProfile ||
                                            !selectedFieldTable
                                        }
                                    >
                                        {fieldPermissionLoading ? "Loading..." : "Refresh Fields"}
                                    </button> */}
                                </div>
                            </div>

                            <div className="mt-2 border border-slate-200 rounded overflow-hidden">
                                <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-200">
                                    <p className="text-[12px] font-semibold text-slate-800">
                                        Field Permissions — {selectedProfileName || "—"}
                                        {selectedFieldTable ? ` / ${selectedFieldTable}` : ""}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                        {selectedProfile && selectedFieldTable
                                            ? fieldPermissionMeta?.source
                                                ? `Source: ${fieldPermissionMeta.source}${fieldPermissionMeta.tableName ? ` · ${fieldPermissionMeta.tableName}` : ""}`
                                                : "Fields load automatically after you select a profile and table."
                                            : "Select a profile, then a table, to load fields."}
                                    </p>
                                </div>

                                <table className="w-full text-[11px]">
                                    <thead className="bg-slate-100/60">
                                        <tr>
                                            <th className="px-2 py-1 text-left">Field label</th>
                                            <th className="px-2 py-1 text-left">API name</th>
                                            <th className="px-2 py-1 text-left">Type</th>
                                            <th className="px-2 py-1 text-center">Mandatory</th>
                                            <th className="px-2 py-1 text-center">Read only</th>
                                            <th className="px-2 py-1 text-center">Editable</th>
                                            {/* <th className="px-2 py-1 text-center">Permission</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!selectedProfile ? (
                                            <tr className="border-t border-slate-100">
                                                <td colSpan={7} className="px-2 py-4 text-center text-slate-500">
                                                    Select a profile first.
                                                </td>
                                            </tr>
                                        ) : !selectedFieldTable ? (
                                            <tr className="border-t border-slate-100">
                                                <td colSpan={7} className="px-2 py-4 text-center text-slate-500">
                                                    Select a table to load field permissions.
                                                </td>
                                            </tr>
                                        ) : fieldPermissionLoading ? (
                                            <tr className="border-t border-slate-100">
                                                <td colSpan={7} className="px-2 py-4 text-center text-slate-500">
                                                    Loading field permissions...
                                                </td>
                                            </tr>
                                        ) : fieldPermissionError ? (
                                            <tr className="border-t border-slate-100">
                                                <td colSpan={7} className="px-2 py-4 text-center text-red-600">
                                                    {fieldPermissionError}
                                                </td>
                                            </tr>
                                        ) : fieldPermissionRows.length > 0 ? (
                                            fieldPermissionRows.map((row) => (
                                                <tr key={row.id} className="border-t border-slate-100">
                                                    <td className="px-2 py-1 font-medium">{row.fieldLabel}</td>
                                                    <td className="px-2 py-1 font-mono text-slate-600">
                                                        {row.fieldName}
                                                    </td>
                                                    <td className="px-2 py-1 text-slate-600">{row.dataType}</td>
                                                    <td className="px-2 py-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="block mx-auto"
                                                            checked={row.isMandatory}
                                                            onChange={(event) =>
                                                                updateFieldPermissionRow(
                                                                    row.id,
                                                                    "isMandatory",
                                                                    event.target.checked
                                                                )
                                                            }
                                                            aria-label={`Mandatory for ${row.fieldLabel}`}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="block mx-auto"
                                                            checked={row.isReadOnly}
                                                            onChange={(event) =>
                                                                updateFieldPermissionRow(
                                                                    row.id,
                                                                    "isReadOnly",
                                                                    event.target.checked
                                                                )
                                                            }
                                                            aria-label={`Read only for ${row.fieldLabel}`}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="block mx-auto"
                                                            checked={row.isEditable}
                                                            onChange={(event) =>
                                                                updateFieldPermissionRow(
                                                                    row.id,
                                                                    "isEditable",
                                                                    event.target.checked
                                                                )
                                                            }
                                                            aria-label={`Editable for ${row.fieldLabel}`}
                                                        />
                                                    </td>
                                                    {/* <td className="px-2 py-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="block mx-auto"
                                                            checked={row.hasPermission}
                                                            onChange={(event) =>
                                                                updateFieldPermissionRow(
                                                                    row.id,
                                                                    "hasPermission",
                                                                    event.target.checked
                                                                )
                                                            }
                                                            aria-label={`Permission for ${row.fieldLabel}`}
                                                        />
                                                    </td> */}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="border-t border-slate-100">
                                                <td colSpan={7} className="px-2 py-4 text-center text-slate-500">
                                                    No fields returned for this table.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-2 flex justify-end">
                                <button
                                    type="button"
                                    className="text-[11px] px-2.5 py-1 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-60"
                                    onClick={() => void saveFieldPermissions()}
                                    disabled={
                                        fieldPermissionSaving ||
                                        fieldPermissionLoading ||
                                        !selectedProfile ||
                                        !selectedFieldTable ||
                                        fieldPermissionRows.length === 0
                                    }
                                >
                                    {fieldPermissionSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "record-type-access" && (
                        <div>
                            <p className="text-[12px] font-semibold text-slate-800">Record Type Access</p>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                                <p className="text-[12px] font-semibold text-slate-800">
                                    Profile:
                                    <select
                                        className="ml-2 border border-slate-300 rounded px-2 py-[2px] text-[11px] text-black bg-white"
                                        value={selectedProfile}
                                        onChange={(event) => setSelectedProfile(event.target.value)}
                                    >
                                        {profiles.map((profile) => (
                                            <option key={profile.id} value={profile.id}>
                                                {profile.profileName}
                                            </option>
                                        ))}
                                    </select>
                                </p>
                                <div className="border border-slate-200 rounded p-2">
                                    <p className="font-medium">Corporate Account</p>
                                    <p className="text-slate-500 mt-1">Enabled</p>
                                </div>
                                <div className="border border-slate-200 rounded p-2">
                                    <p className="font-medium">Agency Account</p>
                                    <p className="text-slate-500 mt-1">Disabled</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {editingProfile ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeEdit();
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-lg"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-profile-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="border-b border-slate-200 px-4 py-3">
                            <p id="edit-profile-title" className="text-[13px] font-semibold text-slate-900">
                                Edit profile
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-mono truncate">ID: {editingProfile.id}</p>
                        </div>
                        <div className="px-4 py-3 space-y-3">
                            <div>
                                <label className="mb-1 block text-[11px] font-medium text-slate-700" htmlFor="edit-profile-name">
                                    Name
                                </label>
                                <input
                                    id="edit-profile-name"
                                    className="w-full rounded-md border border-slate-300 px-2 py-2 text-[12px] outline-none focus:border-slate-500"
                                    value={editName}
                                    onChange={(event) => setEditName(event.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-medium text-slate-700" htmlFor="edit-profile-department">
                                    Department
                                </label>
                                <input
                                    id="edit-profile-department"
                                    className="w-full rounded-md border border-slate-300 px-2 py-2 text-[12px] outline-none focus:border-slate-500"
                                    value={editDepartment}
                                    onChange={(event) => setEditDepartment(event.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-medium text-slate-700" htmlFor="edit-profile-desc">
                                    Description
                                </label>
                                <textarea
                                    id="edit-profile-desc"
                                    className="w-full min-h-[80px] rounded-md border border-slate-300 px-2 py-2 text-[12px] outline-none focus:border-slate-500"
                                    value={editDescription}
                                    onChange={(event) => setEditDescription(event.target.value)}
                                />
                            </div>
                            <label className="flex items-center gap-2 text-[12px] text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editCanSetup}
                                    onChange={(event) => setEditCanSetup(event.target.checked)}
                                    className="rounded border-slate-300"
                                />
                                Can setup
                            </label>
                            {modalError ? <p className="text-[11px] text-red-600">{modalError}</p> : null}
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 bg-slate-50/80 rounded-b-xl">
                            <button
                                type="button"
                                className="text-[11px] px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-white"
                                onClick={closeEdit}
                                disabled={editSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="text-[11px] px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                                onClick={() => void submitEdit()}
                                disabled={editSaving}
                            >
                                {editSaving ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {deleteTarget ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setDeleteTarget(null);
                            setModalError(null);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-lg"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-profile-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="border-b border-slate-200 px-4 py-3">
                            <p id="delete-profile-title" className="text-[13px] font-semibold text-slate-900">
                                Delete profile?
                            </p>
                            <p className="text-[11px] text-slate-600 mt-1">
                                This will remove <span className="font-medium">{deleteTarget.profileName}</span> permanently.
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">{deleteTarget.id}</p>
                        </div>
                        {modalError ? (
                            <div className="px-4 py-2">
                                <p className="text-[11px] text-red-600">{modalError}</p>
                            </div>
                        ) : null}
                        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 bg-slate-50/80 rounded-b-xl">
                            <button
                                type="button"
                                className="text-[11px] px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-white"
                                onClick={() => {
                                    setDeleteTarget(null);
                                    setModalError(null);
                                }}
                                disabled={deleteSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="text-[11px] px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                onClick={() => void submitDelete()}
                                disabled={deleteSaving}
                            >
                                {deleteSaving ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default ProfileSetting;
