import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProfiles, type ProfileApiItem } from "../../../api/profiles";
import { fetchRoles, getRoleId, getRoleName, type RoleApiItem } from "../../../api/roles";
import {
    buildUpdateUserPayload,
    fetchUserById,
    fetchUsers,
    mapUserApiItemToForm,
    mapUserApiItemToRow,
    updateUser,
    type UserFormState,
} from "../../../api/users";
import { useToast } from "../../../components/ToastProvider";
import { languageOptions } from "../../../constant/Language";

const departmentOptions = ["Sales", "Operations", "Finance", "Admin", "Unassigned"];
const teamOptions = ["Platform", "Revenue", "Finance Ops", "Internal"];
const verticalOptions = ["DOOH", "Retail", "Corporate"];
const countryOptions = ["India", "USA", "UAE"];
const stateOptions = ["Maharashtra", "Karnataka", "Delhi", "California"];
const regionOptions = ["North", "South", "East", "West"];
const timeZoneOptions = [
    "Asia/Kolkata (IST)",
    "Asia/Dubai (GST)",
    "Asia/Singapore (SGT)",
    "Europe/London (GMT)",
    "America/New_York (EST)",
    "America/Los_Angeles (PST)",
    "UTC",
    "Asia/Kolkata",
];

function getProfileId(item: ProfileApiItem): string {
    return String(item.id ?? "");
}

function getProfileName(item: ProfileApiItem): string {
    return String(item.name ?? item.id ?? "—");
}

const emptyForm = (): UserFormState => ({
    firstName: "",
    middleName: "",
    lastName: "",
    name: "",
    username: "",
    nickname: "",
    email: "",
    phone: "",
    mobile: "",
    department: "",
    division: "",
    profileId: "",
    roleId: "",
    manager: "",
    delegatedApproverId: "",
    team: "",
    vertical: "",
    country: "",
    stateProvince: "",
    region: "",
    city: "",
    zipPostalCode: "",
    street: "",
    employeeId: "",
    title: "",
    language: "",
    timeZone: "",
    joiningDate: "",
    resignationDate: "",
});

const EditUser = () => {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const { showToast } = useToast();
    const [form, setForm] = useState<UserFormState>(emptyForm());
    const [errorMessage, setErrorMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [optionsError, setOptionsError] = useState<string | null>(null);
    const [profiles, setProfiles] = useState<ProfileApiItem[]>([]);
    const [roles, setRoles] = useState<RoleApiItem[]>([]);
    const [userOptions, setUserOptions] = useState<{ id: string; label: string }[]>([]);

    useEffect(() => {
        if (!userId) {
            setErrorMessage("User id is missing.");
            setLoading(false);
            return;
        }

        let cancelled = false;
        void (async () => {
            setLoading(true);
            setOptionsLoading(true);
            setErrorMessage("");
            setOptionsError(null);
            try {
                const [userItem, profilesResult, rolesResult, usersResult] = await Promise.all([
                    fetchUserById(userId),
                    fetchProfiles(),
                    fetchRoles().catch(() => [] as RoleApiItem[]),
                    fetchUsers().catch(() => []),
                ]);
                if (cancelled) {
                    return;
                }

                setProfiles(profilesResult);
                setRoles(rolesResult);
                setUserOptions(
                    usersResult
                        .map((u) => {
                            const id = String(u.id ?? "");
                            if (!id || id === userId) {
                                return null;
                            }
                            return { id, label: mapUserApiItemToRow(u).user };
                        })
                        .filter((item): item is { id: string; label: string } => item !== null)
                );
                setForm(mapUserApiItemToForm(userItem));
            } catch (error) {
                if (!cancelled) {
                    setErrorMessage(
                        error instanceof Error ? error.message : "Failed to load user"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setOptionsLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const updateForm = <K extends keyof UserFormState>(key: K, value: UserFormState[K]) => {
        setForm((previous) => ({ ...previous, [key]: value }));
    };

    const fullName = [form.firstName, form.middleName, form.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ");

    const onSaveUser = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!userId) {
            return;
        }

        if (
            !form.firstName.trim() ||
            !form.lastName.trim() ||
            !form.email.trim() ||
            !form.department ||
            !form.profileId
        ) {
            setErrorMessage("Please fill all required fields.");
            return;
        }

        setErrorMessage("");
        setSubmitting(true);
        try {
            await updateUser(userId, buildUpdateUserPayload({ ...form, fullName }));
            showToast("User updated successfully");
            navigate(`/setup/user/${userId}`);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to update user");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full min-h-0 w-full items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[12px] text-slate-500">Loading user...</p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
            <form className="flex h-full min-h-0 flex-col" onSubmit={onSaveUser}>
                <div className="view-user-header-in shrink-0 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-[16px] font-semibold text-black">Edit User</p>
                        <p className="text-[11px] text-slate-500">{fullName || "—"}</p>
                        {optionsError ? (
                            <p className="mt-1 text-[11px] text-amber-700">{optionsError}</p>
                        ) : null}
                        {errorMessage ? (
                            <p className="mt-1 text-[11px] text-red-600">{errorMessage}</p>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-100"
                            onClick={() => navigate(userId ? `/setup/user/${userId}` : "/setup")}
                            disabled={submitting}
                        >
                            <span className="inline-flex items-center gap-1">
                                <ArrowLeft size={13} />
                                Cancel
                            </span>
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-slate-900 px-3 py-1.5 text-[11px] text-white hover:bg-slate-800 disabled:opacity-60"
                            disabled={submitting || optionsLoading}
                        >
                            <span className="inline-flex items-center gap-1">
                                <Save size={13} />
                                {submitting ? "Saving..." : "Save"}
                            </span>
                        </button>
                    </div>
                </div>
                </div>

                <div className="view-user-content-in min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[12px] font-semibold text-black">Name & Identity</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                First Name *
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.firstName}
                                onChange={(e) => updateForm("firstName", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Middle Name
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.middleName}
                                onChange={(e) => updateForm("middleName", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Last Name *
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.lastName}
                                onChange={(e) => updateForm("lastName", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Full Name (Auto)
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-[12px] text-slate-700"
                                value={fullName}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Name
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.name}
                                onChange={(e) => updateForm("name", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Nickname
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.nickname}
                                onChange={(e) => updateForm("nickname", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Username
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.username}
                                onChange={(e) => updateForm("username", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[12px] font-semibold text-black">Organisation</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Department *
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.department}
                                onChange={(e) => updateForm("department", e.target.value)}
                                disabled={submitting || optionsLoading}
                            >
                                <option value="">Select Department</option>
                                {departmentOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                                {!departmentOptions.includes(form.department) && form.department ? (
                                    <option value={form.department}>{form.department}</option>
                                ) : null}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Division
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.division}
                                onChange={(e) => updateForm("division", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Profile *
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.profileId}
                                onChange={(e) => updateForm("profileId", e.target.value)}
                                disabled={submitting || optionsLoading}
                            >
                                <option value="">Select Profile</option>
                                {profiles.map((profile) => {
                                    const id = getProfileId(profile);
                                    if (!id) return null;
                                    return (
                                        <option key={id} value={id}>
                                            {getProfileName(profile)}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Role
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.roleId}
                                onChange={(e) => updateForm("roleId", e.target.value)}
                                disabled={submitting || optionsLoading}
                            >
                                <option value="">Select Role</option>
                                {roles.map((role) => {
                                    const id = getRoleId(role);
                                    if (!id) return null;
                                    return (
                                        <option key={id} value={id}>
                                            {getRoleName(role)}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Manager
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.manager}
                                onChange={(e) => updateForm("manager", e.target.value)}
                                disabled={submitting}
                            >
                                <option value="">Select Manager</option>
                                {form.manager &&
                                !userOptions.some((item) => item.id === form.manager) ? (
                                    <option value={form.manager}>{form.manager}</option>
                                ) : null}
                                {userOptions.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Delegated Approver
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.delegatedApproverId}
                                onChange={(e) =>
                                    updateForm("delegatedApproverId", e.target.value)
                                }
                                disabled={submitting}
                            >
                                <option value="">Select Delegated Approver</option>
                                {form.delegatedApproverId &&
                                !userOptions.some((item) => item.id === form.delegatedApproverId) ? (
                                    <option value={form.delegatedApproverId}>
                                        {form.delegatedApproverId}
                                    </option>
                                ) : null}
                                {userOptions.map((item) => (
                                    <option key={`d-${item.id}`} value={item.id}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Team
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.team}
                                onChange={(e) => updateForm("team", e.target.value)}
                                disabled={submitting}
                            >
                                <option value="">Select Team</option>
                                {teamOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                                {form.team && !teamOptions.includes(form.team) ? (
                                    <option value={form.team}>{form.team}</option>
                                ) : null}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Vertical
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.vertical}
                                onChange={(e) => updateForm("vertical", e.target.value)}
                                disabled={submitting}
                            >
                                <option value="">Select Vertical</option>
                                {verticalOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                                {form.vertical && !verticalOptions.includes(form.vertical) ? (
                                    <option value={form.vertical}>{form.vertical}</option>
                                ) : null}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Employee ID
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.employeeId}
                                onChange={(e) => updateForm("employeeId", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[12px] font-semibold text-black">Address & Contact</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Email *
                            </label>
                            <input
                                type="email"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.email}
                                onChange={(e) => updateForm("email", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Mobile
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.mobile}
                                onChange={(e) => updateForm("mobile", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Phone
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.phone}
                                onChange={(e) => updateForm("phone", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Country
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.country}
                                onChange={(e) => updateForm("country", e.target.value)}
                                disabled={submitting}
                            >
                                <option value="">Select Country</option>
                                {countryOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                                {form.country && !countryOptions.includes(form.country) ? (
                                    <option value={form.country}>{form.country}</option>
                                ) : null}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                State/Province
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.stateProvince}
                                onChange={(e) => updateForm("stateProvince", e.target.value)}
                                disabled={submitting}
                            >
                                <option value="">Select State/Province</option>
                                {stateOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                                {form.stateProvince &&
                                !stateOptions.includes(form.stateProvince) ? (
                                    <option value={form.stateProvince}>
                                        {form.stateProvince}
                                    </option>
                                ) : null}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Region
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.region}
                                onChange={(e) => updateForm("region", e.target.value)}
                                disabled={submitting}
                            >
                                <option value="">Select Region</option>
                                {regionOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                                {form.region && !regionOptions.includes(form.region) ? (
                                    <option value={form.region}>{form.region}</option>
                                ) : null}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                City
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.city}
                                onChange={(e) => updateForm("city", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Zip/Postal Code
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.zipPostalCode}
                                onChange={(e) => updateForm("zipPostalCode", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Street
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.street}
                                onChange={(e) => updateForm("street", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[12px] font-semibold text-black">Other Details</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Language
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.language}
                                onChange={(e) => updateForm("language", e.target.value)}
                                disabled={submitting}
                            >
                                <option value="">Select Language</option>
                                {languageOptions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                                {form.language &&
                                !languageOptions.some((item) => item.value === form.language) ? (
                                    <option value={form.language}>{form.language}</option>
                                ) : null}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Title
                            </label>
                            <input
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.title}
                                onChange={(e) => updateForm("title", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Time Zone
                            </label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.timeZone}
                                onChange={(e) => updateForm("timeZone", e.target.value)}
                                disabled={submitting}
                            >
                                <option value="">Select Time Zone</option>
                                {timeZoneOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                                {form.timeZone && !timeZoneOptions.includes(form.timeZone) ? (
                                    <option value={form.timeZone}>{form.timeZone}</option>
                                ) : null}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Joining Date
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.joiningDate}
                                onChange={(e) => updateForm("joiningDate", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-slate-700">
                                Resignation Date
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px]"
                                value={form.resignationDate}
                                onChange={(e) => updateForm("resignationDate", e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                    </div>
                </div>

                </div>
            </form>
        </div>
    );
};

export default EditUser;
