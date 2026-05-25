import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectIsAuthenticated } from "../store/permissionSelectors";

/**
 * Wrap routes that require a stored auth token. Redirects to `/login` when missing.
 */
const RequireAuth = () => {
    const location = useLocation();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default RequireAuth;
