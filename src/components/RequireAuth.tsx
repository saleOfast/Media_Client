import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../lib/authStorage";

/**
 * Wrap routes that require a stored auth token. Redirects to `/login` when missing.
 */
const RequireAuth = () => {
    const location = useLocation();
    const token = getToken();

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default RequireAuth;
