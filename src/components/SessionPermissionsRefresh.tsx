import { useEffect } from "react";
import { fetchProfileUserPermissions } from "../api/profiles";
import { updatePermissions } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

/**
 * Reloads permissions from GET `/profiles/:profileId/effective` so nav matches profile settings
 * without requiring a new login (login response is cached in localStorage).
 */
const SessionPermissionsRefresh = () => {
    const dispatch = useAppDispatch();
    const profileId = useAppSelector((state) => state.auth.user?.profileId);

    useEffect(() => {
        if (!profileId) {
            return;
        }

        let cancelled = false;

        void (async () => {
            try {
                const permissions = await fetchProfileUserPermissions(profileId);
                if (!cancelled && permissions) {
                    dispatch(updatePermissions(permissions));
                }
            } catch {
                /* Keep existing session permissions if refresh fails */
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [profileId, dispatch]);

    return null;
};

export default SessionPermissionsRefresh;
