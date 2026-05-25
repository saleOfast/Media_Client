import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getDefaultNavPath } from "../lib/navConfig";
import { useAppSelector } from "../store/hooks";
import {
    selectCanAccessSetup,
    selectNavItems,
    selectPermissions,
} from "../store/permissionSelectors";

function isPathAllowed(
    pathname: string,
    allowedPaths: Set<string>,
    navItems: { path: string }[]
): boolean {
    if (pathname === "/me/profile") {
        return true;
    }

    if (allowedPaths.size === 0) {
        return pathname === "/home" || pathname.startsWith("/home/");
    }

    if (allowedPaths.has(pathname)) {
        return true;
    }

    return navItems.some(
        (item) => pathname.startsWith(`${item.path}/`) || pathname === item.path
    );
}

/** Blocks routes the user has no tab permission for */
const RequireNavAccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const navItems = useAppSelector(selectNavItems);
    const permissions = useAppSelector(selectPermissions);
    const canSetup = useAppSelector(selectCanAccessSetup);
    const hasRedirectedRef = useRef(false);

    const allowedPaths = new Set(navItems.map((item) => item.path));
    const pathname = location.pathname;
    const isSetupPath = pathname === "/setup" || pathname.startsWith("/setup/");
    const isAllowed =
        (isSetupPath && canSetup) || isPathAllowed(pathname, allowedPaths, navItems);

    useEffect(() => {
        if (isAllowed) {
            hasRedirectedRef.current = false;
            return;
        }

        const fallback = getDefaultNavPath(permissions?.tabs ?? []);
        const safeFallback =
            allowedPaths.size === 0 || allowedPaths.has(fallback)
                ? fallback
                : navItems[0]?.path ?? "/home";

        if (pathname === safeFallback) {
            return;
        }

        if (hasRedirectedRef.current) {
            return;
        }
        hasRedirectedRef.current = true;
        navigate(safeFallback, { replace: true });
    }, [isAllowed, pathname, permissions, navItems, navigate]);

    if (!isAllowed) {
        return null;
    }

    return <Outlet />;
};

export default RequireNavAccess;
