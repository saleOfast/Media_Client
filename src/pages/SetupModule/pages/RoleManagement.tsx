import {
    Crown,
    GitBranch,
    PlusCircle,
    ShieldCheck,
    Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicTable from "../../../components/DynamicTable";
import type { Column } from "../../../Types/Table";
import { defaultRoles, loadRoles, saveRoles, type RoleRow } from "./roleData";

const RoleManagement = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<RoleRow[]>([]);

    useEffect(() => {
        const roleList = loadRoles();
        setRoles(roleList);
        if (!localStorage.getItem("setup_role_list")) {
            saveRoles(defaultRoles);
        }
    }, []);

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
    const groupedByParent = useMemo(() => {
        return roles.reduce<Record<string, RoleRow[]>>((accumulator, role) => {
            const parentName = role.reportsTo;
            if (!accumulator[parentName]) {
                accumulator[parentName] = [];
            }
            accumulator[parentName].push(role);
            return accumulator;
        }, {});
    }, [roles]);

    const rootRoles = groupedByParent["Top Level (Root)"] ?? [];
    const unknownParents = Object.entries(groupedByParent).filter(
        ([parentName]) =>
            parentName !== "Top Level (Root)" &&
            !roles.some((role) => role.roleName === parentName)
    );
    const handleDeleteRole = (roleId: string) => {
        const updatedRoles = roles.filter((role) => role.id !== roleId);
        setRoles(updatedRoles);
        saveRoles(updatedRoles);
    };
    const roleColumns: Column<RoleRow>[] = [
        { title: "Role Name", dataIndex: "roleName" },
        { title: "Reports To", dataIndex: "reportsTo" },
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
            title: "Actions",
            render: (_value, role) => (
                <span className="text-blue-700">
                    <button className="hover:underline">Edit Perms</button>
                    <span className="text-black/40 px-1">|</span>
                    <button className="hover:underline">Clone</button>
                    <span className="text-black/40 px-1">|</span>
                    <button
                        className="hover:underline text-red-700"
                        onClick={() => handleDeleteRole(role.id)}
                    >
                        Delete
                    </button>
                </span>
            ),
        },
    ];

    return (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[17px] font-semibold text-black">Role Management</p>
                    <p className="text-[11px] text-black/70 mt-0.5">
                        Define role hierarchy, map parent role, and link permission profile.
                    </p>
                </div>

                <button
                    className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-sm"
                    onClick={() => navigate("/setup/role/create")}
                >
                    <span className="inline-flex items-center gap-1">
                        <PlusCircle size={14} />
                        Create Role
                    </span>
                </button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 text-[11px]">
                {/* Total Role */}
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1.5 h-[40px]">

                    {/* Left */}
                    <div className="flex items-center gap-1 text-slate-600 text-xs leading-none">
                        <Crown size={12} className="text-slate-600" />
                        <span> Total Roles</span>
                    </div>

                    {/* Middle */}
                    <p className="text-sm font-semibold text-slate-900 leading-none">
                        {roles.length}
                    </p>

                    {/* Right (optional) */}
                    {/* <p className="text-[10px] text-slate-400 leading-none">
                        Total
                    </p> */}

                </div>
                {/* Active Role */}

                <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 h-[40px]">

                    {/* Left */}
                    <div className="flex items-center gap-1 text-emerald-700 text-xs leading-none">
                        <ShieldCheck size={12} />
                        <span>Active Roles</span>
                    </div>

                    {/* Middle */}
                    <p className="text-sm font-semibold text-emerald-700 leading-none">
                        {activeRoleCount}
                    </p>

                    {/* Right */}
                    {/* <p className="text-[10px] text-emerald-600 leading-none">
                        Active
                    </p> */}

                </div>

                {/* inavtive role */}
                <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 h-[40px]">

                    {/* Left */}
                    <div className="text-rose-700 text-xs leading-none">
                        Inactive Roles
                    </div>

                    {/* Middle */}
                    <p className="text-sm font-semibold text-rose-700 leading-none">
                        {inactiveRoleCount}
                    </p>

                    {/* Right */}
                    {/* <p className="text-[10px] text-rose-600 leading-none">
                        Disabled
                    </p> */}

                </div>

                {/*  Assigned Users */}
                <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 h-[40px]">

                    {/* Left */}
                    <div className="flex items-center gap-1 text-blue-700 text-xs leading-none">
                        <Users size={12} />
                        <span>Assigned Users</span>
                    </div>

                    {/* Middle */}
                    <p className="text-sm font-semibold text-blue-700 leading-none">
                        {totalAssignedUsers}
                    </p>

                    {/* Right */}
                    {/* <p className="text-[10px] text-blue-600 leading-none">
                        Total
                    </p> */}

                </div>
            </div>

            <div className="mt-3 grid grid-cols-12 gap-3">
                <div className="col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden">


                    <DynamicTable<RoleRow>
                        columns={roleColumns}
                        data={roles}
                        rowKey="id"
                        emptyText="No roles found"
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
                            Top Level (Root)
                        </div>

                        {rootRoles.length > 0 ? (
                            rootRoles.map((rootRole) => (
                                <div key={rootRole.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                                    <p className="text-[11px] font-semibold text-black">{rootRole.roleName}</p>
                                    <p className="text-[10px] text-black/60">{rootRole.linkedProfile}</p>

                                    {(groupedByParent[rootRole.roleName] ?? []).map((childRole) => (
                                        <div
                                            key={childRole.id}
                                            className="mt-2 ml-3 border-l-2 border-slate-200 pl-2"
                                        >
                                            <p className="text-[10px] font-medium text-black/85">{childRole.roleName}</p>
                                            <p className="text-[10px] text-black/60">{childRole.linkedProfile}</p>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] text-black/60">No root roles added yet.</p>
                        )}

                        {unknownParents.map(([parentName, childRoles]) => (
                            <div key={parentName} className="pt-2 border-t border-slate-200">
                                <p className="text-[10px] font-semibold text-black/80">{parentName}</p>
                                {childRoles.map((childRole) => (
                                    <p key={childRole.id} className="ml-2 text-[10px] text-black/70">- {childRole.roleName}</p>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;
