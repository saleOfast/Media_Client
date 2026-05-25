import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectDefaultNavPath, selectIsAuthenticated } from "../store/permissionSelectors";

const CatchAllRedirect = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const defaultPath = useAppSelector(selectDefaultNavPath);

    if (isAuthenticated) {
        return <Navigate to={defaultPath} replace />;
    }

    return <Navigate to="/login" replace />;
};

export default CatchAllRedirect;
