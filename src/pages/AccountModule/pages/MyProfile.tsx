import { ArrowLeft, User } from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getStoredUser } from "../../../lib/authStorage";

function FieldRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] font-medium text-slate-500">{label}</span>
            <span className="text-[12px] text-slate-900 break-all sm:text-right sm:max-w-[60%]">{value}</span>
        </div>
    );
}

const MyProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useMemo(() => getStoredUser(), [location.key, location.pathname]);

    const display = (value: string | undefined | null) => (value && value.trim() ? value.trim() : "—");

    return (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-[16px] font-semibold text-slate-800 tracking-wide inline-flex items-center gap-2">
                        <User size={18} className="text-slate-600" />
                        My profile
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                        Details from your last sign-in (stored locally until you log out).
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="text-[11px] px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition inline-flex items-center gap-1"
                >
                    <ArrowLeft size={13} />
                    Back
                </button>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                {!user ? (
                    <p className="text-[12px] text-slate-500">No profile data found. Try signing in again.</p>
                ) : (
                    <div className="divide-y divide-slate-100">
                        <FieldRow label="Display name" value={display(user.displayName)} />
                        <FieldRow label="Role" value={display(user.role)} />
                        <FieldRow label="Identifier" value={display(user.identifier)} />
                        <FieldRow label="Email" value={display(user.email)} />
                        <FieldRow label="Phone" value={display(user.phone)} />
                        <FieldRow label="Department" value={display(user.department)} />
                        <FieldRow label="Employee ID" value={display(user.employeeId)} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProfile;
