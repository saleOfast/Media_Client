import {
    Activity,
    Database,
    KeyRound,
    Shield,
    UserPlus,
    Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicTable from "../../../components/DynamicTable";
import type { Column } from "../../../Types/Table";
import { defaultUsers, loadUsers, saveUsers, type UserRow } from "./userData";

const userColumns: Column<UserRow>[] = [
    { title: "User", dataIndex: "user" },
    { title: "Username", dataIndex: "username" },
    { title: "Email", dataIndex: "email" },
    { title: "Department", dataIndex: "department" },
    { title: "Profile", dataIndex: "profile" },
    { title: "Role", dataIndex: "role" },
    { title: "Last Login", dataIndex: "lastLogin" },
    {
        title: "Pwd Status",
        dataIndex: "pwdStatus",
        render: (value) => (
            <span
                className={`px-2 py-[2px] rounded-full text-[10px] font-medium ${value === "Reset Required"

                    }`}
            >
                {String(value)}
            </span>
        ),
    },
    {
        title: "Status",
        dataIndex: "status",
        render: (value) => (
            <span
                className={`px-2 py-[2px] rounded-full text-[10px] font-medium ${value === "Active"

                    }`}
            >
                {String(value)}
            </span>
        ),
    },
    {
        title: "Actions",
        render: () => <span className="">Edit | Disable | View</span>,
    },
];

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserRow[]>([]);

    useEffect(() => {
        const userList = loadUsers();
        setUsers(userList);
        if (!localStorage.getItem("setup_user_list")) {
            saveUsers(defaultUsers);
        }
    }, []);

    const totalUsers = users.length;
    const activeUsers = useMemo(
        () => users.filter((item) => item.status === "Active").length,
        [users]
    );
    const inactiveUsers = useMemo(
        () => users.filter((item) => item.status === "Inactive").length,
        [users]
    );
    const pendingResetUsers = useMemo(
        () => users.filter((item) => item.pwdStatus === "Reset Required").length,
        [users]
    );

    return (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-[16px] font-semibold text-slate-800 tracking-wide">
                        User Management
                    </p>
                    <p className="text-[11px] text-slate-500">
                        Manage platform users, profile assignments, and access control.
                    </p>

                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
                        onClick={() => navigate("/setup/user/create")}
                    >
                        <span className="inline-flex items-center gap-1">
                            <UserPlus size={14} />
                            Create User
                        </span>
                    </button>

                    <button className="text-[11px] px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition">
                        <span className="inline-flex items-center gap-1">
                            <KeyRound size={14} />
                            Reset Password
                        </span>
                    </button>

                    <button className="text-[11px] px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition">
                        <span className="inline-flex items-center gap-1">
                            <Database size={14} />
                            Export
                        </span>
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="mt-3 grid grid-cols-4  gap-2  text-[11px]">

                {/* Total Users */}
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1.5 h-10">

                    {/* Left */}
                    <div className="flex items-center gap-1 text-slate-500 text-xs leading-none">
                        <Users size={12} />
                        <span>Total Users</span>
                    </div>

                    {/* Middle */}
                    <p className="text-sm font-semibold text-slate-900 leading-none">
                        {totalUsers}
                    </p>

                    {/* Right */}
                    {/* <p className="text-[10px] text-slate-400 leading-none">
                        Across all departments
                    </p> */}

                </div>

                {/* Active */}
                <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 h-[40px]">

                    {/* Left */}
                    <div className="flex items-center gap-1 text-emerald-700 text-xs leading-none">
                        <Activity size={12} />
                        <span>Active</span>
                    </div>

                    {/* Middle */}
                    <p className="text-sm font-semibold text-emerald-700 leading-none">
                        {activeUsers}
                    </p>

                    {/* Right */}
                    {/* <p className="text-[10px] text-emerald-600 leading-none">
                        Current
                    </p> */}

                </div>

                {/* Inactive */}
                <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-2 py-1.5 h-[40px]">

                    {/* Left */}
                    <div className="flex items-center gap-1 text-red-700 text-xs leading-none">
                        <Shield size={12} />
                        <span>Inactive</span>
                    </div>

                    {/* Middle */}
                    <p className="text-sm font-semibold text-red-700 leading-none">
                        {inactiveUsers}
                    </p>

                    {/* Right */}
                    {/* <p className="text-[10px] text-red-600 leading-none">
                        Disabled
                    </p> */}

                </div>

                {/* Reset Pending */}
                <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 h-[40px]">

                    {/* Left */}
                    <div className="flex items-center gap-1 text-amber-700 text-xs leading-none">
                        <KeyRound size={12} />
                        <span>Reset</span>
                    </div>

                    {/* Middle */}
                    <p className="text-sm font-semibold text-amber-700 leading-none">
                        {pendingResetUsers}
                    </p>

                    {/* Right */}
                    {/* <p className="text-[10px] text-amber-600 leading-none">
                        Pending
                    </p> */}

                </div>

            </div>

            <div className="mt-3">
                <DynamicTable<UserRow>
                    columns={userColumns}
                    data={users}
                    rowKey="id"
                    emptyText="No users found"
                />
            </div>

        </div>
    );
};

export default UserManagement;