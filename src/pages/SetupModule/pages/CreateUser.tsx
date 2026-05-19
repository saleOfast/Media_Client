import { ArrowLeft, Save, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfiles, type ProfileApiItem } from "../../../api/profiles";
import { fetchRoles, getRoleId, getRoleName, type RoleApiItem } from "../../../api/roles";
import { buildCreateUserPayload, createUser } from "../../../api/users";
import { useToast } from "../../../components/ToastProvider";
import { languageOptions } from "../../../constant/Language";
import { loadUsers } from "./userData";

const departmentOptions = ["Sales", "Operations", "Finance", "Admin"];
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
];

type CreateUserForm = {
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    name: string;
    username: string;
    nickname: string;
    email: string;
    phone: string;
    mobile: string;
    active: boolean;
    department: string;
    division: string;
    profileId: string;
    roleId: string;
    manager: string;
    reportsTo: string;
    delegatedApprover: string;
    team: string;
    vertical: string;
    country: string;
    stateProvince: string;
    region: string;
    city: string;
    zipPostalCode: string;
    street: string;
    employeeId: string;
    title: string;
    language: string;
    timeZone: string;
    joiningDate: string;
    resignationDate: string;
};

function getProfileId(item: ProfileApiItem): string {
    return String(item.id ?? "");
}

function getProfileName(item: ProfileApiItem): string {
    return String(item.name ?? item.id ?? "—");
}

const CreateUser = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [errorMessage, setErrorMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [optionsError, setOptionsError] = useState<string | null>(null);
    const [profiles, setProfiles] = useState<ProfileApiItem[]>([]);
    const [roles, setRoles] = useState<RoleApiItem[]>([]);
    const [form, setForm] = useState<CreateUserForm>({
        firstName: "",
        middleName: "",
        lastName: "",
        fullName: "",
        name: "",
        username: "",
        nickname: "",
        email: "",
        phone: "",
        mobile: "",
        active: true,
        department: "",
        division: "",
        profileId: "",
        roleId: "",
        manager: "",
        reportsTo: "",
        delegatedApprover: "",
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

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            setOptionsLoading(true);
            setOptionsError(null);
            try {
                const [profilesResult, rolesResult] = await Promise.all([
                    fetchProfiles(),
                    fetchRoles().catch(() => [] as RoleApiItem[]),
                ]);
                if (cancelled) {
                    return;
                }
                setProfiles(profilesResult);
                setRoles(rolesResult);
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

    const userLookupOptions = useMemo(
        () => Array.from(new Set(["", "Abhay Sharma", ...loadUsers().map((user) => user.user)])),
        []
    );

    const updateForm = <K extends keyof CreateUserForm>(key: K, value: CreateUserForm[K]) => {
        setForm((previous) => ({ ...previous, [key]: value }));
    };

    const fullName = [form.firstName, form.middleName, form.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ");

    const onSaveUser = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

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
            const payload = buildCreateUserPayload({
                ...form,
                fullName,
            });
            await createUser(payload);
            showToast("User created successfully");
            navigate("/setup");
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to create user");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-180px)] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[16px] font-semibold text-black">👤 Create New User</p>
                </div>
                <button
                    className="text-[14px] text-slate-500 hover:text-slate-800"
                    onClick={() => navigate("/setup")}
                    aria-label="Close create user page"
                    type="button"
                >
                    <X size={16} />
                </button>
            </div>

            {optionsError ? (
                <p className="mt-3 text-[11px] text-amber-700">{optionsError}</p>
            ) : null}

            <form className="mt-4 space-y-4" onSubmit={onSaveUser}>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[12px] font-semibold text-black">Name & Identity</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">First Name *</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.firstName} onChange={(e) => updateForm("firstName", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Middle Name</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.middleName} onChange={(e) => updateForm("middleName", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Last Name *</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.lastName} onChange={(e) => updateForm("lastName", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Full Name (Auto)</label><input className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-[12px] text-slate-700 outline-none" value={fullName} readOnly /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Name</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.name} onChange={(e) => updateForm("name", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Nickname</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.nickname} onChange={(e) => updateForm("nickname", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Username</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.username} onChange={(e) => updateForm("username", e.target.value)} disabled={submitting} /></div>
                        <div className="flex items-end"><label className="flex items-center gap-2 text-[12px] text-slate-700"><input type="checkbox" checked={form.active} onChange={(e) => updateForm("active", e.target.checked)} disabled={submitting} />Active</label></div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[12px] font-semibold text-black">Organisation</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Department *</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.department} onChange={(e) => updateForm("department", e.target.value)} disabled={submitting || optionsLoading}><option value="">Select Department</option>{departmentOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Division</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.division} onChange={(e) => updateForm("division", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Profile *</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.profileId} onChange={(e) => updateForm("profileId", e.target.value)} disabled={submitting || optionsLoading}><option value="">Select Profile</option>{profiles.map((profile) => { const id = getProfileId(profile); if (!id) return null; return <option key={id} value={id}>{getProfileName(profile)}</option>; })}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Role</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.roleId} onChange={(e) => updateForm("roleId", e.target.value)} disabled={submitting || optionsLoading}><option value="">Select Role</option>{roles.map((role) => { const id = getRoleId(role); if (!id) return null; return <option key={id} value={id}>{getRoleName(role)}</option>; })}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Manager</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.manager} onChange={(e) => updateForm("manager", e.target.value)} disabled={submitting}><option value="">Select Manager</option>{userLookupOptions.map((item) => item ? <option key={item} value={item}>{item}</option> : null)}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Reports To</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.reportsTo} onChange={(e) => updateForm("reportsTo", e.target.value)} disabled={submitting}><option value="">Select Reports To</option>{userLookupOptions.map((item) => item ? <option key={`r-${item}`} value={item}>{item}</option> : null)}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Delegated Approver</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.delegatedApprover} onChange={(e) => updateForm("delegatedApprover", e.target.value)} disabled={submitting}><option value="">Select Delegated Approver</option>{userLookupOptions.map((item) => item ? <option key={`d-${item}`} value={item}>{item}</option> : null)}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Team</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.team} onChange={(e) => updateForm("team", e.target.value)} disabled={submitting}><option value="">Select Team</option>{teamOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Vertical</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.vertical} onChange={(e) => updateForm("vertical", e.target.value)} disabled={submitting}><option value="">Select Vertical</option>{verticalOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Employee ID</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.employeeId} onChange={(e) => updateForm("employeeId", e.target.value)} disabled={submitting} /></div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[12px] font-semibold text-black">Address & Contact</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Email *</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Phone</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Mobile</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.mobile} onChange={(e) => updateForm("mobile", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Country</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.country} onChange={(e) => updateForm("country", e.target.value)} disabled={submitting}><option value="">Select Country</option>{countryOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">State/Province</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.stateProvince} onChange={(e) => updateForm("stateProvince", e.target.value)} disabled={submitting}><option value="">Select State/Province</option>{stateOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Region</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.region} onChange={(e) => updateForm("region", e.target.value)} disabled={submitting}><option value="">Select Region</option>{regionOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">City</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.city} onChange={(e) => updateForm("city", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Zip/Postal Code</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.zipPostalCode} onChange={(e) => updateForm("zipPostalCode", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Street</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.street} onChange={(e) => updateForm("street", e.target.value)} disabled={submitting} /></div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[12px] font-semibold text-black">Other Details</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Language</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.language} onChange={(e) => updateForm("language", e.target.value)} disabled={submitting}><option value="">Select Language</option>{languageOptions.map((item: { value: string; label: string }) => (<option key={item.value} value={item.value}>{item.label}</option>))}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Title</label><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.title} onChange={(e) => updateForm("title", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Time Zone</label><select className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.timeZone} onChange={(e) => updateForm("timeZone", e.target.value)} disabled={submitting}><option value="">Select Time Zone</option>{timeZoneOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Joining Date</label><input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.joiningDate} onChange={(e) => updateForm("joiningDate", e.target.value)} disabled={submitting} /></div>
                        <div><label className="mb-1 block text-[11px] font-medium text-slate-700">Resignation Date</label><input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500" value={form.resignationDate} onChange={(e) => updateForm("resignationDate", e.target.value)} disabled={submitting} /></div>
                    </div>
                </div>

                {errorMessage ? <p className="text-[11px] text-red-600">{errorMessage}</p> : null}
                <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] text-slate-400 inline-flex items-center gap-1">
                        <UserPlus size={12} />
                        {optionsLoading ? "Loading profiles and roles…" : "Submit to create user via API"}
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="text-[11px] px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition"
                            onClick={() => navigate("/setup")}
                            disabled={submitting}
                        >
                            <span className="inline-flex items-center gap-1">
                                <ArrowLeft size={13} />
                                Cancel
                            </span>
                        </button>

                        <button
                            type="submit"
                            className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition disabled:opacity-60"
                            disabled={submitting || optionsLoading}
                        >
                            <span className="inline-flex items-center gap-1">
                                <Save size={13} />
                                {submitting ? "Creating..." : "Submit"}
                            </span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateUser;
