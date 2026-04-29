import { Activity, Building2, PlusCircle, Shield, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicTable from "../../../components/DynamicTable";
import type { Column } from "../../../Types/Table";

interface ProfileRow {
    profileName: string;
    description: string;
    users: string;
    department: string;
    modifiedBy: string;
    modifiedOn: string;
    actions: string;
}

interface TabPermissionRow {
    tabName: string;
    readOnly: boolean;
    defaultOn: boolean;
    description: string;
}

const profileList: ProfileRow[] = [
    {
        profileName: "System Admin",
        description: "Full system access — all modules",
        users: "1 User",
        department: "All Departments",
        modifiedBy: "System",
        modifiedOn: "System",
        actions: "Edit Perms",
    },
    {
        profileName: "Sales Manager",
        description: "Full sales + read finance",
        users: "2 Users",
        department: "Sales",
        modifiedBy: "Abhay Sharma",
        modifiedOn: "15-Mar-26",
        actions: "Edit Perms | Clone",
    },
    {
        profileName: "Sales Executive",
        description: "Own orders only",
        users: "3 Users",
        department: "Sales",
        modifiedBy: "Abhay Sharma",
        modifiedOn: "10-Mar-26",
        actions: "Edit Perms | Clone",
    },
];

const tabPermissionRows: TabPermissionRow[] = [
    {
        tabName: "Home (fixed)",
        readOnly: false,
        defaultOn: true,
        description: "Dashboard with approvals, KPIs, activity feed and charts",
    },
    {
        tabName: "Accounts",
        readOnly: false,
        defaultOn: true,
        description: "Customer & agency account management, onboarding, credit control",
    },
    {
        tabName: "Contacts",
        readOnly: false,
        defaultOn: true,
        description: "All persons linked to Accounts — decision makers, billing contacts",
    },
    {
        tabName: "Projects",
        readOnly: false,
        defaultOn: true,
        description: "Campaign projects — parent master record for child Inventory sites",
    },
    {
        tabName: "Inventory",
        readOnly: false,
        defaultOn: true,
        description: "Inventory sites — child records linked to parent Projects",
    },
    {
        tabName: "Sale Orders",
        readOnly: false,
        defaultOn: true,
        description: "Sale Orders — PO tracking, campaign orders, mounting stage management",
    },
];

const profileColumns: Column<ProfileRow>[] = [
    { title: "Profile Name", dataIndex: "profileName" },
    { title: "Description", dataIndex: "description" },
    { title: "Users", dataIndex: "users" },
    { title: "Department", dataIndex: "department" },
    { title: "Modified By", dataIndex: "modifiedBy" },
    { title: "Modified On", dataIndex: "modifiedOn" },
    {
        title: "Actions",
        dataIndex: "actions",
        render: (value) => <span className="text-blue-700">{String(value)}</span>,
    },
];

const ProfileSetting = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all-profiles");
    const [selectedProfile, setSelectedProfile] = useState("System Admin");
    const totalProfiles = profileList.length;
    const totalUsers = useMemo(
        () =>
            profileList.reduce((sum, profile) => {
                const count = Number.parseInt(profile.users, 10);
                return sum + (Number.isNaN(count) ? 0 : count);
            }, 0),
        []
    );
    const salesProfiles = useMemo(
        () => profileList.filter((profile) => profile.department === "Sales").length,
        []
    );
    const systemProfiles = useMemo(
        () => profileList.filter((profile) => profile.modifiedBy === "System").length,
        []
    );

    return (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">
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
                        <PlusCircle size={14} />
                        Create New Profile
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
                    className={`border rounded p-1 text-[11px] ${activeTab === "field-permissions" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white"}`}
                    onClick={() => setActiveTab("field-permissions")}
                >
                    Field Permissions
                </button>
                <button
                    className={`border rounded p-1 text-[11px] ${activeTab === "record-type-access" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white"}`}
                    onClick={() => setActiveTab("record-type-access")}
                >
                    Record Type Access
                </button>
            </div>

            {activeTab === "all-profiles" ? (
                <div className="mt-0">
                    <DynamicTable<ProfileRow>
                        columns={profileColumns}
                        data={profileList}
                        rowKey="profileName"
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
                                        {profileList.map((profile) => (
                                            <option key={profile.profileName} value={profile.profileName}>
                                                {profile.profileName}
                                            </option>
                                        ))}
                                    </select>
                                </p>

                                <div className=" flex items-center gap-2">
                                    <button className="text-[11px] px-1.5 py-1 border   rounded hover:bg-emerald-50 cursor-pointer">
                                        Grant All
                                    </button>
                                    <button className="text-[11px] px-2.5 py-1 border rounded hover:bg-red-50 cursor-pointer">
                                        Revoke All
                                    </button>
                                </div>
                            </div>



                            <div className="mt-2 border border-slate-200 rounded overflow-hidden">
                                <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-200">
                                    <p className="text-[12px] font-semibold text-slate-800">Tab Permissions — {selectedProfile}</p>
                                    <p className="text-[10px] text-slate-500">Changes take effect on user&apos;s next login</p>
                                </div>

                                <table className="w-full text-[11px]">
                                    <thead className="bg-slate-100/60">
                                        <tr>
                                            <th className="px-2 py-1 text-left">Tab / Navigation Item</th>
                                            <th className="px-2 py-1 text-left">Read Only</th>
                                            <th className="px-2 py-1 text-left">Default On</th>
                                            <th className="px-2 py-1 text-left">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tabPermissionRows.map((row) => (
                                            <tr key={row.tabName} className="border-t border-slate-100">
                                                <td className="px-2 py-1 font-medium">{row.tabName}</td>
                                                <td className="px-2 py-1">
                                                    <input type="checkbox" defaultChecked={row.readOnly} />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input type="checkbox" defaultChecked={row.defaultOn} />
                                                </td>
                                                <td className="px-2 py-1 text-slate-600">{row.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>



                            <div className="mt-2 flex justify-end">
                                <button className="text-[11px] px-2.5 py-1 border border-slate-300 rounded-md hover:bg-slate-100">
                                    Save Tab Permissions
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "table-permissions" && (
                        <div>
                            <p className="text-[12px] font-semibold text-slate-800">Table Permissions</p>
                            <table className="w-full mt-2 text-[11px] border border-slate-200 rounded overflow-hidden">
                                <thead className="bg-slate-100/60">
                                    <tr>
                                        <th className="px-2 py-1 text-left">Table</th>
                                        <th className="px-2 py-1 text-left">Read</th>
                                        <th className="px-2 py-1 text-left">Write</th>
                                        <th className="px-2 py-1 text-left">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-slate-100">
                                        <td className="px-2 py-1">Accounts</td>
                                        <td className="px-2 py-1">Yes</td>
                                        <td className="px-2 py-1">Yes</td>
                                        <td className="px-2 py-1">No</td>
                                    </tr>
                                    <tr className="border-t border-slate-100">
                                        <td className="px-2 py-1">Invoices</td>
                                        <td className="px-2 py-1">Yes</td>
                                        <td className="px-2 py-1">No</td>
                                        <td className="px-2 py-1">No</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "field-permissions" && (
                        <div>
                            <p className="text-[12px] font-semibold text-slate-800">Field Permissions</p>
                            <div className="mt-2 space-y-1 text-[11px]">
                                <div className="flex items-center justify-between border border-slate-200 rounded p-2">
                                    <span>Customer Name</span>
                                    <span className="text-emerald-700">Editable</span>
                                </div>
                                <div className="flex items-center justify-between border border-slate-200 rounded p-2">
                                    <span>Credit Limit</span>
                                    <span className="text-amber-700">Read Only</span>
                                </div>
                                <div className="flex items-center justify-between border border-slate-200 rounded p-2">
                                    <span>Tax Number</span>
                                    <span className="text-red-700">Hidden</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "record-type-access" && (
                        <div>
                            <p className="text-[12px] font-semibold text-slate-800">Record Type Access</p>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                                <div className="border border-slate-200 rounded p-2">
                                    <p className="font-medium">Retail Account</p>
                                    <p className="text-slate-500 mt-1">Enabled</p>
                                </div>
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
        </div>
    );
};

export default ProfileSetting;
