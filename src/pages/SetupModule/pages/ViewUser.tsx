import { ArrowLeft, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProfiles } from "../../../api/profiles";
import { fetchRoles, getRoleId, getRoleName } from "../../../api/roles";
import {
    fetchUserById,
    fetchUsers,
    mapUserApiItemToRow,
    type UserApiItem,
} from "../../../api/users";

function FieldRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 border-b border-slate-200 py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] font-medium text-black/60">{label}</span>
            <span className="text-[12px] text-black break-all sm:text-right sm:max-w-[60%]">
                {value || "—"}
            </span>
        </div>
    );
}

function displayValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "—";
    }
    const text = String(value).trim();
    return text || "—";
}

function formatDate(value: unknown): string {
    if (typeof value !== "string" || !value.trim()) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function Section({
    title,
    children,
    animationDelayMs = 0,
}: {
    title: string;
    children: React.ReactNode;
    animationDelayMs?: number;
}) {
    return (
        <div
            className="view-user-section-in rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-md"
            style={{ animationDelay: `${animationDelayMs}ms` }}
        >
            <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-semibold text-black">
                {title}
            </p>
            <div className="px-3">{children}</div>
        </div>
    );
}

const ViewUser = () => {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<UserApiItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [profileName, setProfileName] = useState("—");
    const [roleName, setRoleName] = useState("—");
    const [managerName, setManagerName] = useState("—");
    const [delegatedApproverName, setDelegatedApproverName] = useState("—");

    useEffect(() => {
        if (!userId) {
            setError("User id is missing.");
            setLoading(false);
            return;
        }

        let cancelled = false;
        void (async () => {
            setLoading(true);
            setError("");
            try {
                const [userItem, profiles, roles, allUsers] = await Promise.all([
                    fetchUserById(userId),
                    fetchProfiles().catch(() => []),
                    fetchRoles().catch(() => []),
                    fetchUsers().catch(() => []),
                ]);
                if (cancelled) {
                    return;
                }

                setUser(userItem);

                const profileNameById = new Map(
                    profiles.map((p) => [String(p.id ?? ""), String(p.name ?? "")])
                );
                const roleNameById = new Map(
                    roles.map((r) => {
                        const id = getRoleId(r);
                        return [id, getRoleName(r)] as const;
                    })
                );
                const userNameById = new Map(
                    allUsers.map((u) => {
                        const id = String(u.id ?? "");
                        const row = mapUserApiItemToRow(u, profileNameById, roleNameById);
                        return [id, row.user] as const;
                    })
                );

                const pid = String(userItem.profileId ?? "");
                const rid = String(userItem.roleId ?? "");
                setProfileName(
                    displayValue(
                        userItem.profileName ?? profileNameById.get(pid) ?? (pid || null)
                    )
                );
                setRoleName(
                    displayValue(userItem.roleName ?? roleNameById.get(rid) ?? (rid || null))
                );
                const mid = String(userItem.manager ?? "");
                setManagerName(displayValue(userNameById.get(mid) ?? (mid || null)));
                const did = String(userItem.delegatedApproverId ?? "");
                setDelegatedApproverName(displayValue(userNameById.get(did) ?? (did || null)));
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load user");
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const displayName = useMemo(() => {
        if (!user) {
            return "—";
        }
        const full = typeof user.fullName === "string" ? user.fullName.trim() : "";
        if (full) {
            return full;
        }
        return String(user.name ?? user.username ?? user.email ?? "—");
    }, [user]);

    const statusLabel =
        user && typeof user.isActive === "boolean"
            ? user.isActive
                ? "Active"
                : "Inactive"
            : "—";

    return (
        <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Page header — fixed, visually distinct from content */}
            <header className="view-user-header-in shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-2.5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            User details
                        </span>
                        <span className="hidden h-3 w-px shrink-0 bg-slate-300 sm:block" aria-hidden />
                        <h1 className="truncate text-[14px] font-semibold text-slate-900">
                            {displayName}
                        </h1>
                        <span className="hidden h-3 w-px shrink-0 bg-slate-300 md:block" aria-hidden />
                        <span className="min-w-0 truncate text-[11px] text-slate-600">
                            {displayValue(user?.email)}
                        </span>
                        {user ? (
                            <span
                                className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                                    statusLabel === "Active"
                                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                        : "border-slate-300 bg-white text-slate-700"
                                }`}
                            >
                                {statusLabel}
                            </span>
                        ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] text-slate-700 shadow-sm hover:bg-slate-100"
                            onClick={() => navigate("/setup")}
                        >
                            <span className="inline-flex items-center gap-1">
                                <ArrowLeft size={12} />
                                Back
                            </span>
                        </button>
                        {userId ? (
                            <button
                                type="button"
                                className="rounded-md bg-slate-900 px-2.5 py-1 text-[11px] text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                                onClick={() => navigate(`/setup/user/${userId}/edit`)}
                                disabled={loading || !!error}
                            >
                                <span className="inline-flex items-center gap-1">
                                    <Pencil size={12} />
                                    Edit
                                </span>
                            </button>
                        ) : null}
                    </div>
                </div>
            </header>

            {/* Scrollable body only */}
            <div className="view-user-content-in min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            {loading ? (
                <p className="p-4 text-[12px] text-black/50">Loading user details...</p>
            ) : error ? (
                <p className="p-4 text-[12px] text-red-600">{error}</p>
            ) : user ? (
                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                    <Section title="Name & Identity" animationDelayMs={80}>
                        <FieldRow label="Full Name" value={displayName} />
                        <FieldRow label="First Name" value={displayValue(user.firstName)} />
                        <FieldRow label="Middle Name" value={displayValue(user.middleName)} />
                        <FieldRow label="Last Name" value={displayValue(user.lastName)} />
                        <FieldRow label="Name" value={displayValue(user.name)} />
                        <FieldRow label="Username" value={displayValue(user.username)} />
                        <FieldRow label="Nickname" value={displayValue(user.nickname)} />
                        <FieldRow label="Employee ID" value={displayValue(user.employeeId)} />
                    </Section>

                    <Section title="Organisation" animationDelayMs={140}>
                        <FieldRow label="Department" value={displayValue(user.department)} />
                        <FieldRow label="Division" value={displayValue(user.division)} />
                        <FieldRow label="Profile" value={profileName} />
                        <FieldRow label="Role" value={roleName} />
                        <FieldRow label="Manager" value={managerName} />
                        <FieldRow label="Delegated Approver" value={delegatedApproverName} />
                        <FieldRow label="Team" value={displayValue(user.team)} />
                        <FieldRow label="Vertical" value={displayValue(user.vertical)} />
                        <FieldRow label="Title" value={displayValue(user.title)} />
                    </Section>

                    <Section title="Contact" animationDelayMs={200}>
                        <FieldRow label="Email" value={displayValue(user.email)} />
                        <FieldRow label="Mobile" value={displayValue(user.mobile)} />
                        <FieldRow label="Phone" value={displayValue(user.phone)} />
                        <FieldRow label="Language" value={displayValue(user.language)} />
                        <FieldRow label="Time Zone" value={displayValue(user.timeZone)} />
                    </Section>

                    <Section title="Address" animationDelayMs={260}>
                        <FieldRow label="Country" value={displayValue(user.country)} />
                        <FieldRow label="State/Province" value={displayValue(user.stateProvince)} />
                        <FieldRow label="Region" value={displayValue(user.region)} />
                        <FieldRow label="City" value={displayValue(user.city)} />
                        <FieldRow label="Zip/Postal Code" value={displayValue(user.zipPostalCode)} />
                        <FieldRow label="Street" value={displayValue(user.street)} />
                    </Section>

                    <Section title="Dates" animationDelayMs={320}>
                        <FieldRow label="Joining Date" value={displayValue(user.joiningDate)} />
                        <FieldRow label="Resignation Date" value={displayValue(user.resignationDate)} />
                        <FieldRow label="Created" value={formatDate(user.createdAt)} />
                        <FieldRow label="Updated" value={formatDate(user.updatedAt)} />
                    </Section>
                </div>
            ) : null}
            </div>
        </div>
    );
};

export default ViewUser;
