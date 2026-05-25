import { createSelector } from "@reduxjs/toolkit";
import { buildNavItemsFromTabs, getDefaultNavPath, type NavItem } from "../lib/navConfig";
import {
    canAccessSetupModule,
    canAccessSetupPath,
    canAccessTable,
    canCreateOnTable,
    canDeleteOnTable,
    canEditOnTable,
    getAllowedFieldsForTable,
    getFieldPermission,
    isSetupAdministrator,
} from "../lib/permissionUtils";
import type { TabPermission } from "../Types/auth";
import type { RootState } from "./index";

const EMPTY_TABS: TabPermission[] = [];
const EMPTY_NAV: NavItem[] = [];
const FALLBACK_HOME_NAV: NavItem[] = [
    { tabName: "home", path: "/home", label: "Home", order: 0 },
];

const selectAuthToken = (state: RootState) => state.auth.token;
const selectAuthCanSetup = (state: RootState) => state.auth.canSetup;
const selectAuthTabs = (state: RootState) => state.auth.permissions?.tabs ?? EMPTY_TABS;
const selectAuthPermissions = (state: RootState) => state.auth.permissions;

export const selectAuth = (state: RootState) => state.auth;
export const selectToken = selectAuthToken;
export const selectCanSetup = selectAuthCanSetup;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectPermissions = selectAuthPermissions;
export const selectIsAuthenticated = createSelector([selectAuthToken], (token) => Boolean(token));

export const selectIsSetupAdministrator = createSelector(
    [selectAuthCanSetup, selectAuthPermissions],
    (canSetup, permissions) => isSetupAdministrator(canSetup, permissions)
);

/** Top nav from profile tab permissions (`isVisible` only). Setup lives in the header. */
export const selectNavItems = createSelector(
    [selectAuthTabs, selectAuthToken],
    (tabs, token): NavItem[] => {
        const items = buildNavItemsFromTabs(tabs);
        if (items.length > 0) {
            return items;
        }
        if (token) {
            return FALLBACK_HOME_NAV;
        }
        return EMPTY_NAV;
    }
);

export const selectDefaultNavPath = createSelector([selectAuthTabs], (tabs) =>
    getDefaultNavPath(tabs, false)
);

export const selectCanAccessSetup = createSelector(
    [selectAuthPermissions, selectAuthCanSetup],
    (permissions, canSetup) => canAccessSetupModule(permissions, canSetup)
);

export {
    canAccessSetupPath,
    canAccessTable,
    canCreateOnTable,
    canEditOnTable,
    canDeleteOnTable,
    getFieldPermission,
    getAllowedFieldsForTable,
};
