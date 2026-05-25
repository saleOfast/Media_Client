import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectDefaultNavPath } from "../store/permissionSelectors";

const DefaultHomeRedirect = () => {
    const target = useAppSelector(selectDefaultNavPath);
    return <Navigate to={target} replace />;
};

export default DefaultHomeRedirect;
