import {
    Activity,
    Database,
    KeyRound,
    Shield,
    UserPlus,
    Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfiles } from "../../../api/profiles";
import { fetchRoles, getRoleId, getRoleName } from "../../../api/roles";
import { fetchUsers, mapUserApiItemsToRows, type UserRow } from "../../../api/users";
import DynamicTable from "../../../components/DynamicTable";
import type { Column } from "../../../Types/Table";

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    const loadUserList = useCallback(async () => {
        setLoading(true);
        setListError(null);
        try {
            const [items, profiles, roles] = await Promise.all([
                fetchUsers(),
                fetchProfiles().catch(() => []),
                fetchRoles().catch(() => []),
            ]);

            const profileNameById = new Map<string, string>();
            for (const profile of profiles) {
                const id = String(profile.id ?? "");
                if (id) {
                    profileNameById.set(id, String(profile.name ?? id));
                }
            }

            const roleNameById = new Map<string, string>();
            for (const role of roles) {
                const id = getRoleId(role);
                if (id) {
                    roleNameById.set(id, getRoleName(role));
                }
            }

            setUsers(mapUserApiItemsToRows(items, { profileNameById, roleNameById }));
        } catch (error) {
            setListError(error instanceof Error ? error.message : "Failed to load users");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadUserList();
    }, [loadUserList]);

    const userColumns: Column<UserRow>[] = useMemo(
        () => [
            { title: "User", dataIndex: "user" },
            { title: "Username", dataIndex: "username" },
            { title: "Email", dataIndex: "email" },
            { title: "Department", dataIndex: "department" },
            { title: "Profile", dataIndex: "profile" },
            { title: "Role", dataIndex: "role" },
            // { title: "Last Login", dataIndex: "lastLogin" },
            // {
            //     title: "Pwd Status",
            //     dataIndex: "pwdStatus",
            //     render: (value) => (
            //         <span
            //             className={`px-2 py-[2px] rounded-full text-[10px] font-medium ${
            //                 value === "Reset Required"
            //                     ? "bg-amber-100 text-amber-800"
            //                     : "bg-slate-100 text-slate-700"
            //             }`}
            //         >
            //             {String(value)}
            //         </span>
            //     ),
            // },
            {
                title: "Status",
                dataIndex: "status",
                render: (value) => (
                    <span
                        className={`px-2 py-[2px] rounded-full text-[10px] font-medium ${value === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                            }`}
                    >
                        {String(value)}
                    </span>
                ),
            },
            {
                title: "Actions",
                render: () => <span className="text-blue-700">Edit | Disable | View</span>,
            },
        ],
        []
    );

    const totalUsers = users.length;
    const activeUsers = useMemo(
        () => users.filter((item) => item.status === "Active").length,
        [users]
    );
    const inactiveUsers = useMemo(
        () => users.filter((item) => item.status === "Inactive").length,
        [users]
    );
    return (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm h-100">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-[16px] font-semibold text-slate-800 tracking-wide">
                        User Management
                    </p>
                    <p className="text-[11px] text-slate-500">
                        Manage platform users, profile assignments, and access control.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* <button
                        type="button"
                        className="text-[11px] px-2.5 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition"
                        onClick={() => void loadUserList()}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Refresh"}
                    </button> */}
                    <button
                        type="button"
                        className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
                        onClick={() => navigate("/setup/user/create")}
                    >
                        <span className="inline-flex items-center gap-1">
                            <UserPlus size={14} />
                            Create
                        </span>
                    </button>

                    {/* <button
                        type="button"
                        className="text-[11px] px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition"
                    >
                        <span className="inline-flex items-center gap-1">
                            <KeyRound size={14} />
                            Reset Password
                        </span>
                    </button> */}

                    <button
                        type="button"
                        className="text-[11px] px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition"
                    >
                        <span className="inline-flex items-center gap-1">
                            <Database size={14} />
                            Export
                        </span>
                    </button>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1.5 h-10">
                    <div className="flex items-center gap-1 text-slate-500 text-xs leading-none">
                        <Users size={12} />
                        <span>Total Users</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-none">{totalUsers}</p>
                </div>

                <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 h-[40px]">
                    <div className="flex items-center gap-1 text-emerald-700 text-xs leading-none">
                        <Activity size={12} />
                        <span>Active</span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-700 leading-none">{activeUsers}</p>
                </div>

                <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-2 py-1.5 h-[40px]">
                    <div className="flex items-center gap-1 text-red-700 text-xs leading-none">
                        <Shield size={12} />
                        <span>Inactive</span>
                    </div>
                    <p className="text-sm font-semibold text-red-700 leading-none">{inactiveUsers}</p>
                </div>

                {/* Reset password pending metric — hidden until pwd status is available from API */}
                {/* <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 h-[40px]">
                    <div className="flex items-center gap-1 text-amber-700 text-xs leading-none">
                        <KeyRound size={12} />
                        <span>Reset</span>
                    </div>
                    <p className="text-sm font-semibold text-amber-700 leading-none">0</p>
                </div> */}
            </div>

            <div className="mt-3">
                {listError ? (
                    <p className="mb-2 px-1 text-[11px] text-red-600">{listError}</p>
                ) : null}
                <DynamicTable<UserRow>
                    columns={userColumns}
                    data={users}
                    rowKey="id"
                    emptyText={loading ? "Loading users..." : "No users found"}
                />
            </div>
        </div>
    );
};

export default UserManagement;
