import { NavLink, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { canAccessSetupPath, selectCanSetup } from "../../store/permissionSelectors";

const SETUP_NAV = [
    { path: "/setup", label: "User Management", end: true },
    { path: "/setup/profile", label: "Profile Setting", end: false },
    { path: "/setup/role", label: "Role Setting", end: false },
    { path: "/setup/object", label: "Object Manager", end: false },
] as const;

const SetupLayout = () => {
    const baseLink =
        "px-2 py-1 rounded text-[11px] text-gray-700 leading-tight transition";
    const activeLink = "bg-blue-100 text-[#0070D2]   font-medium";

    return (
        <div className="flex h-full min-h-0 flex-1 bg-gray-50">
            <aside className="flex h-full w-52 shrink-0 flex-col border-r bg-white">
                <div className="shrink-0 px-2 py-1 text-[10px] font-semibold tracking-wide text-white bg-[#3E6B9A]">
                    SETUP
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-[2px] overflow-y-auto p-1">
                    {SETUP_NAV.map((item) => (
                        <SetupNavItem
                            key={item.path}
                            path={item.path}
                            label={item.label}
                            end={item.end}
                            baseLink={baseLink}
                            activeLink={activeLink}
                        />
                    ))}
                </div>
            </aside>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
                <Outlet />
            </div>
        </div>
    );
};

function SetupNavItem({
    path,
    label,
    end,
    baseLink,
    activeLink,
}: {
    path: string;
    label: string;
    end: boolean;
    baseLink: string;
    activeLink: string;
}) {
    const permissions = useAppSelector((state) => state.auth.permissions);
    const canSetup = useAppSelector(selectCanSetup);
    const canAccess = canAccessSetupPath(permissions, path, canSetup);
    if (!canAccess) {
        return null;
    }

    return (
        <NavLink
            to={path}
            end={end}
            className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : "hover:bg-gray-100"}`
            }
        >
            {label}
        </NavLink>
    );
}

export default SetupLayout;
