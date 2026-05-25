import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfiles, type ProfileApiItem } from "../../../api/profiles";
import { createRole, fetchRoles, getRoleId, getRoleName, type RoleApiItem } from "../../../api/roles";
import { useToast } from "../../../components/ToastProvider";

const ROOT_PARENT_VALUE = "";

function getProfileId(item: ProfileApiItem): string {
    return String(item.id ?? "");
}

function getProfileName(item: ProfileApiItem): string {
    return String(item.name ?? item.id ?? "—");
}

const CreateRole = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [roleName, setRoleName] = useState("");
    const [parentRoleId, setParentRoleId] = useState(ROOT_PARENT_VALUE);
    const [linkedProfileId, setLinkedProfileId] = useState("");
    const [description, setDescription] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [parentRoles, setParentRoles] = useState<RoleApiItem[]>([]);
    const [profiles, setProfiles] = useState<ProfileApiItem[]>([]);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [optionsError, setOptionsError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            setOptionsLoading(true);
            setOptionsError(null);
            try {
                const [rolesResult, profilesResult] = await Promise.all([
                    fetchRoles().catch(() => [] as RoleApiItem[]),
                    fetchProfiles(),
                ]);
                if (cancelled) {
                    return;
                }
                setParentRoles(rolesResult);
                setProfiles(profilesResult);
            } catch (error) {
                if (!cancelled) {
                    setOptionsError(
                        error instanceof Error ? error.message : "Failed to load form options"
                    );
                }
            } finally {
                if (!cancelled) {
                    setOptionsLoading(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const onCreateRole = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");

        if (!roleName.trim() || !linkedProfileId) {
            setErrorMessage("Please fill all required fields.");
            return;
        }

        setSubmitting(true);
        try {
            await createRole({
                name: roleName.trim(),
                description: description.trim(),
                parentRoleId: parentRoleId || null,
                linkedProfileId,
            });
            showToast("Role created successfully");
            navigate("/setup/role");
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to create role");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-full min-h-0 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[16px] font-semibold text-slate-800">Create Role</p>
                    <p className="text-[11px] text-slate-500">
                        Add new role and map parent hierarchy with linked profile.
                    </p>
                </div>
                <button
                    type="button"
                    className="text-[11px] px-2.5 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100"
                    onClick={() => navigate("/setup/role")}
                >
                    <span className="inline-flex items-center gap-1">
                        <ArrowLeft size={13} />
                        Back to Roles
                    </span>
                </button>
            </div>

            {optionsError ? (
                <p className="mt-3 text-[11px] text-amber-700">{optionsError}</p>
            ) : null}

            <form className="mt-4 space-y-3" onSubmit={onCreateRole}>
                <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        * Role Name
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                        placeholder="e.g. Sales Manager"
                        value={roleName}
                        onChange={(event) => setRoleName(event.target.value)}
                        disabled={submitting}
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Reports To (Parent)
                    </label>
                    <select
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                        value={parentRoleId}
                        onChange={(event) => setParentRoleId(event.target.value)}
                        disabled={submitting || optionsLoading}
                    >
                        <option value={ROOT_PARENT_VALUE}>Top Level (Root)</option>
                        {parentRoles.map((role) => {
                            const id = getRoleId(role);
                            if (!id) {
                                return null;
                            }
                            return (
                                <option key={id} value={id}>
                                    {getRoleName(role)}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        * Linked Profile
                    </label>
                    <select
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                        value={linkedProfileId}
                        onChange={(event) => setLinkedProfileId(event.target.value)}
                        disabled={submitting || optionsLoading}
                    >
                        <option value="">-- Select Profile --</option>
                        {profiles.map((profile) => {
                            const id = getProfileId(profile);
                            if (!id) {
                                return null;
                            }
                            return (
                                <option key={id} value={id}>
                                    {getProfileName(profile)}
                                </option>
                            );
                        })}
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
                        disabled={submitting}
                    />
                </div>

                {errorMessage ? (
                    <p className="text-[11px] text-red-600">{errorMessage}</p>
                ) : null}

                <div className="pt-1">
                    <button
                        type="submit"
                        className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition disabled:opacity-60"
                        disabled={submitting || optionsLoading}
                    >
                        <span className="inline-flex items-center gap-1">
                            <Save size={13} />
                            {submitting ? "Creating..." : "Create Role"}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRole;
