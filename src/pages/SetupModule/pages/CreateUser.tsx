import { ArrowLeft, Save, UserPlus, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createUserEntry, loadUsers, saveUsers } from "./userData";
import { loadRoles } from "./roleData";

const departmentOptions = ["Sales", "Operations", "Finance", "Admin"];
const profileOptions = ["Admin", "Manager", "Executive", "Support"];

const CreateUser = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("user@engageoutdoor.in");
    const [mobile, setMobile] = useState("+91 98200 XXXXX");
    const [department, setDepartment] = useState("");
    const [profile, setProfile] = useState("");
    const [role, setRole] = useState("Sales Lead");
    const [reportsTo, setReportsTo] = useState("Abhay Sharma");
    const [errorMessage, setErrorMessage] = useState("");
    const roleOptions = useMemo(
        () =>
            Array.from(
                new Set(["Sales Lead", ...loadRoles().map((roleItem) => roleItem.roleName)])
            ),
        []
    );
    const reportToOptions = useMemo(
        () =>
            Array.from(
                new Set(["Abhay Sharma", ...loadUsers().map((userItem) => userItem.user)])
            ),
        []
    );

    const onSaveUser = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!firstName.trim() || !lastName.trim() || !email.trim() || !department || !profile) {
            setErrorMessage("Please fill all required fields.");
            return;
        }

        const existingUsers = loadUsers();
        const createdUser = createUserEntry({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            department,
            profile,
            role: role.trim(),
            reportsTo: reportsTo.trim(),
        });

        saveUsers([createdUser, ...existingUsers]);
        navigate("/setup");
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
                >
                    <X size={16} />
                </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={onSaveUser}>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[12px] font-semibold text-black">👤 Name & Identity</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-medium text-black mb-1">* First Name</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                                placeholder="First name"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-black mb-1">* Last Name</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                                placeholder="Last name"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-black mb-1">* Email</label>
                            <input
                                type="email"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                                placeholder="user@engageoutdoor.in"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-black mb-1">Mobile</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                                placeholder="+91 98200 XXXXX"
                                value={mobile}
                                onChange={(event) => setMobile(event.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[12px] font-semibold text-black">🏢 Organisation</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-medium text-black mb-1">* Department</label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                                value={department}
                                onChange={(event) => setDepartment(event.target.value)}
                            >
                                <option value="">-- Select --</option>
                                {departmentOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-medium text-black mb-1">* Profile</label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                                value={profile}
                                onChange={(event) => setProfile(event.target.value)}
                            >
                                <option value="">-- Select --</option>
                                {profileOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-medium text-black mb-1">Role</label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                                value={role}
                                onChange={(event) => setRole(event.target.value)}
                            >
                                <option value="">-- Select --</option>
                                {roleOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-medium text-black mb-1">Reports To</label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[12px] outline-none focus:border-slate-500"
                                value={reportsTo}
                                onChange={(event) => setReportsTo(event.target.value)}
                            >
                                <option value="">-- Select --</option>
                                {reportToOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {errorMessage ? <p className="text-[11px] text-red-600">{errorMessage}</p> : null}

                <div className="flex items-center gap-2">
                    <button
                        type="submit"
                        className="text-[11px] px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
                    >
                        <span className="inline-flex items-center gap-1">
                            <Save size={13} />
                            Save User
                        </span>
                    </button>

                    <button
                        type="button"
                        className="text-[11px] px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition"
                        onClick={() => navigate("/setup")}
                    >
                        <span className="inline-flex items-center gap-1">
                            <ArrowLeft size={13} />
                            Cancel
                        </span>
                    </button>

                    <span className="ml-auto text-[10px] text-slate-400 inline-flex items-center gap-1">
                        <UserPlus size={12} />
                        New user will appear in User Management list
                    </span>
                </div>
            </form>
        </div>
    );
};

export default CreateUser;
