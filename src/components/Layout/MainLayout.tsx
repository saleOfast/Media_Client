import { Outlet, NavLink } from "react-router-dom";
import SessionPermissionsRefresh from "../SessionPermissionsRefresh";
import Header from "./Header";
import { useAppSelector } from "../../store/hooks";
import { selectNavItems } from "../../store/permissionSelectors";

const MainLayout = () => {
    const navItems = useAppSelector(selectNavItems);

    return (
        <div className="flex h-full min-h-screen flex-col overflow-hidden">
            <SessionPermissionsRefresh />
            <Header />

            <div className="flex shrink-0 gap-6 border-b p-3 text-[11px]">
                {navItems.map((item) => (
                    <NavLink key={item.path} to={item.path}>
                        {item.label}
                    </NavLink>
                ))}
            </div>

            <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
