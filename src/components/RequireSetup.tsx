import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectCanAccessSetup } from "../store/permissionSelectors";
import { getDefaultNavPath } from "../lib/navConfig";

const RequireSetup = () => {
    const canSetup = useAppSelector(selectCanAccessSetup);
    const permissions = useAppSelector((state) => state.auth.permissions);

    if (!canSetup) {
        const fallback = getDefaultNavPath(permissions?.tabs ?? []);
        return <Navigate to={fallback} replace />;
    }

    return <Outlet />;
};

export default RequireSetup;
