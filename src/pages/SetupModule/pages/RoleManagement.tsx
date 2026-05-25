import {
    Crown,
    GitBranch,
    Pencil,
    PlusCircle,
    ShieldCheck,
    Trash2,
    Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    deleteRole,
    fetchRoleById,
    fetchRoles,
    mapRoleApiItemToRow,
    mapRoleApiItemsToRows,
    ROOT_PARENT_LABEL,
    updateRole,
    updateRoleParent,
    type RoleRow,
} from "../../../api/roles";
import DynamicTable from "../../../components/DynamicTable";
import { useToast } from "../../../components/ToastProvider";
import type { Column } from "../../../Types/Table";

const ROOT_PARENT_VALUE = "";

/** Placeholder list — replace with API-driven options later */
const DUMMY_ASSIGNABLE_USERS = [
    { id: "u1", label: "Rahul Kumar — rahul.kumar@example.com" },
    { id: "u2", label: "Sneha Joshi — sneha.joshi@example.com" },
    { id: "u3", label: "Dev Patil — dev.patil@example.com" },
    { id: "u4", label: "Admin — admin@example.com" },
];

const RoleManagement = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [roles, setRoles] = useState<RoleRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);
    const [assignModalRole, setAssignModalRole] = useState<RoleRow | null>(null);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [editModalRole, setEditModalRole] = useState<RoleRow | null>(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editParentRoleId, setEditParentRoleId] = useState(ROOT_PARENT_VALUE);
    const [editLoading, setEditLoading] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);
    const [deleteSaving, setDeleteSaving] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const loadRoleList = useCallback(async () => {
        setLoading(true);
        setListError(null);
        try {
            const items = await fetchRoles();
            setRoles(mapRoleApiItemsToRows(items));
        } catch (error) {
            setListError(error instanceof Error ? error.message : "Failed to load roles");
            setRoles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadRoleList();
    }, [loadRoleList]);

    const activeRoleCount = useMemo(
        () => roles.filter((item) => item.status === "Active").length,
        [roles]
    );
    const totalAssignedUsers = useMemo(
        () => roles.reduce((total, role) => total + role.assignedUsers, 0),
        [roles]
    );
    const inactiveRoleCount = useMemo(
        () => roles.filter((item) => item.status === "Inactive").length,
        [roles]
    );

    const rootRoles = useMemo(
        () => roles.filter((role) => !role.parentRoleId),
        [roles]
    );

    const childrenByParentId = useMemo(() => {
        return roles.reduce<Record<string, RoleRow[]>>((accumulator, role) => {
            if (!role.parentRoleId) {
                return accumulator;
            }
            if (!accumulator[role.parentRoleId]) {
                accumulator[role.parentRoleId] = [];
            }
            accumulator[role.parentRoleId].push(role);
            return accumulator;
        }, {});
    }, [roles]);

    const parentOptions = useMemo(
        () => roles.filter((role) => role.id !== editModalRole?.id),
        [roles, editModalRole?.id]
    );

    const openEditModal = async (role: RoleRow) => {
        setEditModalRole(role);
        setEditName(role.roleName);
        setEditDescription(role.description);
        setEditParentRoleId(role.parentRoleId ?? ROOT_PARENT_VALUE);
        setEditError("");
        setEditLoading(true);
        try {
            const fresh = await fetchRoleById(role.id);
            const nameById = new Map(roles.map((item) => [item.id, item.roleName]));
            const mapped = mapRoleApiItemToRow(fresh, nameById);
            setEditModalRole(mapped);
            setEditName(mapped.roleName);
            setEditDescription(mapped.description);
            setEditParentRoleId(mapped.parentRoleId ?? ROOT_PARENT_VALUE);
        } catch (error) {
            setEditError(error instanceof Error ? error.message : "Failed to load role details");
        } finally {
            setEditLoading(false);
        }
    };

    const closeEditModal = () => {
        setEditModalRole(null);
        setEditError("");
        setEditLoading(false);
        setEditSaving(false);
    };

    const submitDelete = async () => {
        if (!deleteTarget) {
            return;
        }
        setDeleteSaving(true);
        setDeleteError("");
        try {
            await deleteRole(deleteTarget.id);
            showToast("Role deleted successfully");
            setDeleteTarget(null);
            await loadRoleList();
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : "Failed to delete role");
        } finally {
            setDeleteSaving(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editModalRole) {
            return;
        }
        if (!editName.trim()) {
            setEditError("Role name is required.");
            return;
        }

        const nextParentId = editParentRoleId || null;
        const parentChanged = (editModalRole.parentRoleId ?? null) !== nextParentId;
        const nameChanged = editModalRole.roleName !== editName.trim();
        const descriptionChanged = editModalRole.description !== editDescription.trim();

        if (!nameChanged && !descriptionChanged && !parentChanged) {
            closeEditModal();
            return;
        }

        setEditSaving(true);
        setEditError("");
        try {
            if (nameChanged || descriptionChanged) {
                await updateRole(editModalRole.id, {
                    name: editName.trim(),
                    description: editDescription.trim(),
                });
            }
            if (parentChanged) {
                await updateRoleParent(editModalRole.id, { parentRoleId: nextParentId });
            }
            showToast("Role updated successfully");
            closeEditModal();
            await loadRoleList();
        } catch (error) {
            setEditError(error instanceof Error ? error.message : "Failed to update role");
        } finally {
            setEditSaving(false);
        }
    };

    const roleColumns: Column<RoleRow>[] = [
        { title: "Role Name", dataIndex: "roleName" },
        {
            title: "Reports To",
            dataIndex: "reportsTo",
            render: (value, role) => (
                <span className="text-slate-800" title={role.parentRoleId ?? ROOT_PARENT_LABEL}>
                    {String(value)}
                </span>
            ),
        },
        { title: "Linked Profile", dataIndex: "linkedProfile" },
        {
            title: "Assigned Users",
            dataIndex: "assignedUsers",
            render: (value) => (
                <span className="px-2 py-[2px] rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                    {String(value)}
                </span>
            ),
        },
        {
            title: "Assign User",
            render: (_value, role) => (
                <button
                    type="button"
                    className="text-[11px] px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
                    onClick={() => {
                        setAssignModalRole(role);
                        setSelectedUserId("");
                    }}
                >
                    Assign to
                </button>
            ),
        },
        {
            title: "Actions",
            render: (_value, role) => (
                <span className="inline-flex items-center gap-1.5">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-slate-300 p-1 text-slate-700 hover:bg-slate-50 transition"
                        title="Edit role"
                        aria-label={`Edit ${role.roleName}`}
                        onClick={() => void openEditModal(role)}
                    >
                        <Pencil size={13} />
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-red-200 p-1 text-red-600 hover:bg-red-50 transition"
                        title="Delete role"
                        aria-label={`Delete ${role.roleName}`}
                        onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(role);
                        }}
                    >
                        <Trash2 size={13} />
                    </button>
                </span>
            ),
        },
    ];

    return (
        <div className="h-full min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[17px] font-semibold text-black">Role Management</p>
                    <p className="text-[11px] text-black/70 mt-0.5">
                        Define role hierarchy, map parent role, and link permission profile.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* <button
                        type="button"
                        className="text-[11px] px-2.5 py-1.5 border border-slate-300 rounded-lg hover:bg-white transition"
                        onClick={() => void loadRoleList()}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Refresh"}
                    </button> */}
                    <button
                        type="button"
                        className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-sm"
                        onClick={() => navigate("/setup/role/create")}
                    >
                        <span className="inline-flex items-center gap-1">
                            <PlusCircle size={14} />
                            Create
                        </span>
                    </button>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 text-[11px]">
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1.5 h-[40px]">
                    <div className="flex items-center gap-1 text-slate-600 text-xs leading-none">
                        <Crown size={12} className="text-slate-600" />
                        <span> Total Roles</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-none">{roles.length}</p>
                </div>

                <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 h-[40px]">
                    <div className="flex items-center gap-1 text-emerald-700 text-xs leading-none">
                        <ShieldCheck size={12} />
                        <span>Active Roles</span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-700 leading-none">{activeRoleCount}</p>
                </div>

                <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 h-[40px]">
                    <div className="text-rose-700 text-xs leading-none">Inactive Roles</div>
                    <p className="text-sm font-semibold text-rose-700 leading-none">{inactiveRoleCount}</p>
                </div>

                <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 h-[40px]">
                    <div className="flex items-center gap-1 text-blue-700 text-xs leading-none">
                        <Users size={12} />
                        <span>Assigned Users</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-700 leading-none">{totalAssignedUsers}</p>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-12 gap-3">
                <div className="col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
                    {listError ? (
                        <p className="px-3 py-4 text-[11px] text-red-600">{listError}</p>
                    ) : null}
                    <DynamicTable<RoleRow>
                        columns={roleColumns}
                        data={roles}
                        rowKey="id"
                        emptyText={loading ? "Loading roles..." : "No roles found"}
                    />
                </div>

                <div className="col-span-4 rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
                        <p className="text-[12px] font-semibold text-black">Role Hierarchy</p>
                        <p className="text-[10px] text-black/60">Parent-child role mapping</p>
                    </div>

                    <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
                        <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/70 bg-slate-100 px-2 py-1 rounded-md">
                            <GitBranch size={11} />
                            {ROOT_PARENT_LABEL}
                        </div>

                        {rootRoles.length > 0 ? (
                            rootRoles.map((rootRole) => (
                                <div key={rootRole.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                                    <p className="text-[11px] font-semibold text-black">{rootRole.roleName}</p>
                                    <p className="text-[10px] text-black/60">{rootRole.linkedProfile}</p>

                                    {(childrenByParentId[rootRole.id] ?? []).map((childRole) => (
                                        <div
                                            key={childRole.id}
                                            className="mt-2 ml-3 border-l-2 border-slate-200 pl-2"
                                        >
                                            <p className="text-[10px] font-medium text-black/85">
                                                {childRole.roleName}
                                            </p>
                                            <p className="text-[10px] text-black/60">{childRole.linkedProfile}</p>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] text-black/60">
                                {loading ? "Loading hierarchy..." : "No root roles yet."}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {deleteTarget ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setDeleteTarget(null);
                            setDeleteError("");
                        }
                    }}
                >
                    <div
                        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-lg"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-role-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="border-b border-slate-200 px-4 py-3">
                            <p id="delete-role-title" className="text-[13px] font-semibold text-slate-900">
                                Delete role?
                            </p>
                            <p className="text-[11px] text-slate-600 mt-1">
                                This will remove{" "}
                                <span className="font-medium">{deleteTarget.roleName}</span> permanently.
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">
                                {deleteTarget.id}
                            </p>
                        </div>
                        {deleteError ? (
                            <div className="px-4 py-2">
                                <p className="text-[11px] text-red-600">{deleteError}</p>
                            </div>
                        ) : null}
                        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 bg-slate-50/80 rounded-b-xl">
                            <button
                                type="button"
                                className="text-[11px] px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-white"
                                onClick={() => {
                                    setDeleteTarget(null);
                                    setDeleteError("");
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

            {editModalRole ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeEditModal();
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-lg"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-role-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="border-b border-slate-200 px-4 py-3">
                            <p id="edit-role-title" className="text-[13px] font-semibold text-slate-900">
                                Edit Role
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{editModalRole.id}</p>
                        </div>

                        <div className="px-4 py-3 space-y-3">
                            {editLoading ? (
                                <p className="text-[11px] text-slate-500">Loading role details...</p>
                            ) : null}

                            <div>
                                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                    Role Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-slate-300 px-2 py-2 text-[12px]"
                                    value={editName}
                                    onChange={(event) => setEditName(event.target.value)}
                                    disabled={editSaving || editLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    className="w-full rounded-md border border-slate-300 px-2 py-2 text-[12px] min-h-[72px]"
                                    value={editDescription}
                                    onChange={(event) => setEditDescription(event.target.value)}
                                    disabled={editSaving || editLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                    Reports To (Parent)
                                </label>
                                <select
                                    className="w-full rounded-md border border-slate-300 px-2 py-2 text-[12px]"
                                    value={editParentRoleId}
                                    onChange={(event) => setEditParentRoleId(event.target.value)}
                                    disabled={editSaving || editLoading}
                                >
                                    <option value={ROOT_PARENT_VALUE}>{ROOT_PARENT_LABEL}</option>
                                    {parentOptions.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.roleName}
                                        </option>
                                    ))}
                                </select>
                                {editModalRole.parentRoleId ? (
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Current parent:{" "}
                                        <span className="font-medium text-slate-700">
                                            {editModalRole.parentRoleName ?? editModalRole.reportsTo}
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Current parent: {ROOT_PARENT_LABEL}
                                    </p>
                                )}
                            </div>

                            {editError ? (
                                <p className="text-[11px] text-red-600">{editError}</p>
                            ) : null}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 bg-slate-50/80 rounded-b-xl">
                            <button
                                type="button"
                                className="text-[11px] px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-white transition"
                                onClick={closeEditModal}
                                disabled={editSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="text-[11px] px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-50"
                                disabled={editSaving || editLoading}
                                onClick={() => void handleSaveEdit()}
                            >
                                {editSaving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {assignModalRole ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setAssignModalRole(null);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-lg"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="assign-role-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="border-b border-slate-200 px-4 py-3">
                            <p id="assign-role-title" className="text-[13px] font-semibold text-slate-900">
                                Assign role to users
                            </p>
                        </div>

                        <div className="px-4 py-3 space-y-3">
                            <label
                                className="block text-[11px] font-medium text-slate-700"
                                htmlFor="assign-user-select"
                            >
                                Select user
                            </label>
                            <select
                                id="assign-user-select"
                                className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400"
                                value={selectedUserId}
                                onChange={(event) => setSelectedUserId(event.target.value)}
                            >
                                <option value="">Choose a user…</option>
                                {DUMMY_ASSIGNABLE_USERS.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 bg-slate-50/80 rounded-b-xl">
                            <button
                                type="button"
                                className="text-[11px] px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-white transition"
                                onClick={() => setAssignModalRole(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="text-[11px] px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-50"
                                disabled={!selectedUserId}
                                onClick={() => {
                                    setAssignModalRole(null);
                                    setSelectedUserId("");
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default RoleManagement;
