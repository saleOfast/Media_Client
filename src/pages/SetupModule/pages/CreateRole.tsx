import { ArrowLeft, Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createRoleEntry, loadRoles, saveRoles } from "./roleData";

const profileOptions = [
    "Sales Profile",
    "Operations Profile",
    "Finance Profile",
    "Admin Profile",
];

const CreateRole = () => {
    const navigate = useNavigate();
    const [roleName, setRoleName] = useState("");
    const [reportsTo, setReportsTo] = useState("Top Level (Root)");
    const [linkedProfile, setLinkedProfile] = useState("");
    const [description, setDescription] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const onCreateRole = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!roleName.trim() || !linkedProfile) {
            setErrorMessage("Please fill all required fields.");
            return;
        }

        const existingRoles = loadRoles();
        const createdRole = createRoleEntry({
            roleName: roleName.trim(),
            reportsTo,
            linkedProfile,
            description: description.trim(),
        });

        saveRoles([createdRole, ...existingRoles]);
        navigate("/setup/role");
    };

    return (
        <div className="w-full min-h-[calc(100vh-180px)] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[16px] font-semibold text-slate-800">Create Role</p>
                    <p className="text-[11px] text-slate-500">
                        Add new role and map parent hierarchy with linked profile.
                    </p>
                </div>
                <button
                    className="text-[11px] px-2.5 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100"
                    onClick={() => navigate("/setup/role")}
                >
                    <span className="inline-flex items-center gap-1">
                        <ArrowLeft size={13} />
                        Back to Roles
                    </span>
                </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={onCreateRole}>
                <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        * Role Name
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                        placeholder="e.g. Senior Sales Rep"
                        value={roleName}
                        onChange={(event) => setRoleName(event.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Reports To (Parent)
                    </label>
                    <select
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                        value={reportsTo}
                        onChange={(event) => setReportsTo(event.target.value)}
                    >
                        <option value="Top Level (Root)">Top Level (Root)</option>
                        {loadRoles().map((role) => (
                            <option key={role.id} value={role.roleName}>
                                {role.roleName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        * Linked Profile
                    </label>
                    <select
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                        value={linkedProfile}
                        onChange={(event) => setLinkedProfile(event.target.value)}
                    >
                        <option value="">-- Select Profile --</option>
                        {profileOptions.map((profile) => (
                            <option key={profile} value={profile}>
                                {profile}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Description
                    </label>
                    <textarea
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500 min-h-[90px]"
                        placeholder="Short role description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </div>

                {errorMessage ? (
                    <p className="text-[11px] text-red-600">{errorMessage}</p>
                ) : null}

                <div className="pt-1">
                    <button
                        type="submit"
                        className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
                    >
                        <span className="inline-flex items-center gap-1">
                            <Save size={13} />
                            Create Role
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRole;
