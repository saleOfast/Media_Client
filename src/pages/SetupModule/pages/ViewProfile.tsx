import { ArrowLeft, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchProfileById,
    resolveProfileAssignedUsers,
    type ProfileApiItem,
} from "../../../api/profiles";

function FieldRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 border-b border-slate-200 py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] font-medium text-black/60">{label}</span>
            <span className="break-all text-[12px] text-black sm:max-w-[60%] sm:text-right">
                {value || "—"}
            </span>
        </div>
    );
}

function displayValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "—";
    }
    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
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

function resolveUserCount(item: ProfileApiItem): string {
    const count =
        typeof item.assignedUsersCount === "number"
            ? item.assignedUsersCount
            : typeof item.userCount === "number"
              ? item.userCount
              : typeof item.usersCount === "number"
                ? item.usersCount
                : undefined;
    if (count === undefined) {
        return "—";
    }
    return `${count} User${count === 1 ? "" : "s"}`;
}

function AssignedUsersRow({
    users,
    onUserClick,
}: {
    users: { id: string; userName: string }[];
    onUserClick: (userId: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1.5 border-b border-slate-200 py-2 last:border-0 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-[11px] font-medium text-black/60">Assigned User Names</span>
            <div className="sm:max-w-[60%] sm:text-right">
                {users.length === 0 ? (
                    <span className="text-[12px] text-black">—</span>
                ) : (
                    <ul className="inline-flex flex-col items-start gap-1 sm:items-end">
                        {users.map((user, index) =>
                            user.id ? (
                                <li key={user.id}>
                                    <button
                                        type="button"
                                        className="text-[12px] font-medium text-blue-700 hover:underline"
                                        onClick={() => onUserClick(user.id)}
                                    >
                                        {user.userName}
                                    </button>
                                </li>
                            ) : (
                                <li key={`${user.userName}-${index}`} className="text-[12px] text-black">
                                    {user.userName}
                                </li>
                            )
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
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

const ViewProfile = () => {
    const navigate = useNavigate();
    const { profileId } = useParams<{ profileId: string }>();
    const [profile, setProfile] = useState<ProfileApiItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!profileId) {
            setError("Profile id is missing.");
            setLoading(false);
            return;
        }

        let cancelled = false;
        void (async () => {
            setLoading(true);
            setError("");
            try {
                const item = await fetchProfileById(profileId);
                if (!cancelled) {
                    setProfile(item);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load profile");
                    setProfile(null);
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
    }, [profileId]);

    const displayName = useMemo(() => {
        if (!profile) {
            return "—";
        }
        return displayValue(profile.name);
    }, [profile]);

    const departmentLabel = useMemo(() => {
        if (!profile) {
            return "—";
        }
        const dept = profile.department;
        if (dept === null || dept === undefined || String(dept).trim() === "") {
            return "—";
        }
        return String(dept);
    }, [profile]);

    const canSetupLabel =
        profile && typeof profile.canSetup === "boolean"
            ? profile.canSetup
                ? "Can setup"
                : "No setup access"
            : null;

    const assignedUsers = useMemo(
        () => (profile ? resolveProfileAssignedUsers(profile) : []),
        [profile]
    );

    return (
        <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="view-user-header-in shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-2.5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Profile details
                        </span>
                        <span className="hidden h-3 w-px shrink-0 bg-slate-300 sm:block" aria-hidden />
                        <h1 className="truncate text-[14px] font-semibold text-slate-900">
                            {displayName}
                        </h1>
                        <span className="hidden h-3 w-px shrink-0 bg-slate-300 md:block" aria-hidden />
                        <span className="min-w-0 truncate text-[11px] text-slate-600">
                            {departmentLabel}
                        </span>
                        {canSetupLabel ? (
                            <span
                                className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                                    profile?.canSetup
                                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                        : "border-slate-300 bg-white text-slate-700"
                                }`}
                            >
                                {canSetupLabel}
                            </span>
                        ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] text-slate-700 shadow-sm hover:bg-slate-100"
                            onClick={() => navigate("/setup/profile")}
                        >
                            <span className="inline-flex items-center gap-1">
                                <ArrowLeft size={12} />
                                Back
                            </span>
                        </button>
                        {profileId ? (
                            <button
                                type="button"
                                className="rounded-md bg-slate-900 px-2.5 py-1 text-[11px] text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                                onClick={() =>
                                    navigate("/setup/profile", {
                                        state: { editProfileId: profileId },
                                    })
                                }
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

            <div className="view-user-content-in min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                {loading ? (
                    <p className="p-4 text-[12px] text-black/50">Loading profile details...</p>
                ) : error ? (
                    <p className="p-4 text-[12px] text-red-600">{error}</p>
                ) : profile ? (
                    <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                        <Section title="Profile Details" animationDelayMs={80}>
                            <FieldRow label="Profile Name" value={displayValue(profile.name)} />
                            <FieldRow label="Description" value={displayValue(profile.description)} />
                            <FieldRow label="Department" value={departmentLabel} />
                            <FieldRow label="Can Setup" value={displayValue(profile.canSetup)} />
                        </Section>

                        <Section title="Usage" animationDelayMs={140}>
                            <FieldRow label="Assigned Users Count" value={resolveUserCount(profile)} />
                            <AssignedUsersRow
                                users={assignedUsers}
                                onUserClick={(userId) => navigate(`/setup/user/${userId}`)}
                            />
                        </Section>

                        <Section title="System" animationDelayMs={200}>
                            <FieldRow label="Profile ID" value={displayValue(profile.id)} />
                            <FieldRow
                                label="Permission Cache Version"
                                value={displayValue(profile.permissionCacheVersion)}
                            />
                        </Section>

                        <Section title="Audit" animationDelayMs={260}>
                            <FieldRow
                                label="Modified By"
                                value={displayValue(
                                    profile.modifiedByName ??
                                        profile.updatedBy ??
                                        profile.modifiedBy ??
                                        profile.createdBy ??
                                        profile.created_by
                                )}
                            />
                            <FieldRow label="Created" value={formatDate(profile.createdAt ?? profile.created_at)} />
                            <FieldRow label="Updated" value={formatDate(profile.updatedAt ?? profile.updated_at)} />
                        </Section>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default ViewProfile;
