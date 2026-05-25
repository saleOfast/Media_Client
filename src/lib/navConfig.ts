import type { TabPermission } from "../Types/auth";

export type NavItem = {
    tabName: string;
    path: string;
    label: string;
    order: number;
};

/** Maps API `tabName` values to app routes and display labels */
const TAB_ROUTE_REGISTRY: Record<string, { path: string; label: string; order: number }> = {
    home: { path: "/home", label: "Home", order: 0 },
    account: { path: "/accounts", label: "Accounts", order: 1 },
    accounts: { path: "/accounts", label: "Accounts", order: 1 },
    account__c: { path: "/accounts", label: "Accounts", order: 1 },
    accounts__c: { path: "/accounts", label: "Accounts", order: 1 },
    contacts: { path: "/contacts", label: "Contacts", order: 2 },
    contact: { path: "/contacts", label: "Contacts", order: 2 },
    contacts__c: { path: "/contacts", label: "Contacts", order: 2 },
    projects: { path: "/projects", label: "Projects", order: 3 },
    project: { path: "/projects", label: "Projects", order: 3 },
    projects__c: { path: "/projects", label: "Projects", order: 3 },
    inventory: { path: "/inventory", label: "Inventory", order: 4 },
    inventory__c: { path: "/inventory", label: "Inventory", order: 4 },
    product: { path: "/product", label: "Product", order: 5 },
    product__c: { path: "/product", label: "Product", order: 5 },
    setup: { path: "/setup", label: "Setup", order: 6 },
    setup__c: { path: "/setup", label: "Setup", order: 6 },
};

export function normalizeTabKey(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, "_");
}

/** Resolve API tab key to a registry entry (handles `account__c` → accounts, etc.) */
function resolveRegistryKey(tabName: string): string | null {
    const key = normalizeTabKey(tabName);
    if (TAB_ROUTE_REGISTRY[key]) {
        return key;
    }

    const withoutObjectSuffix = key.replace(/__c$/, "");
    if (withoutObjectSuffix && TAB_ROUTE_REGISTRY[withoutObjectSuffix]) {
        return withoutObjectSuffix;
    }

    const singular = withoutObjectSuffix.replace(/s$/, "");
    if (singular && TAB_ROUTE_REGISTRY[singular]) {
        return singular;
    }

    return null;
}

export function resolveTabRoute(
    tabName: string
): { path: string; label: string; order: number } | null {
    const registryKey = resolveRegistryKey(tabName);
    if (!registryKey) {
        return null;
    }
    return TAB_ROUTE_REGISTRY[registryKey];
}

/** Tab is allowed when API `isVisible` is true (profile “Default On”). */
export function isTabVisible(tab: TabPermission): boolean {
    return tab.isVisible === true;
}

/** Prefer `account__c` over `account` when both exist (matches profile settings). */
export function pickCanonicalTabPermission(tabs: TabPermission[]): TabPermission | null {
    if (tabs.length === 0) {
        return null;
    }
    const withSuffix = tabs.find((tab) => normalizeTabKey(tab.tabName).endsWith("__c"));
    return withSuffix ?? tabs[0];
}

function groupTabsByRoute(tabs: TabPermission[]): Map<string, TabPermission[]> {
    const byPath = new Map<string, TabPermission[]>();

    for (const tab of tabs) {
        const route = resolveTabRoute(tab.tabName);
        if (!route) {
            continue;
        }
        const group = byPath.get(route.path) ?? [];
        group.push(tab);
        byPath.set(route.path, group);
    }

    return byPath;
}

/**
 * Build top nav from login `permissions.tabs`.
 * One item per route; uses canonical tab (`__c` if present); only when its `isVisible` is true.
 */
export function buildNavItemsFromTabs(tabs: TabPermission[]): NavItem[] {
    const byPath = groupTabsByRoute(tabs);
    const items: NavItem[] = [];

    for (const [, group] of byPath) {
        const canonical = pickCanonicalTabPermission(group);
        if (!canonical || !isTabVisible(canonical)) {
            continue;
        }
        const route = resolveTabRoute(canonical.tabName);
        if (!route) {
            continue;
        }
        const label =
            typeof canonical.tabLabel === "string" && canonical.tabLabel.trim()
                ? canonical.tabLabel.trim()
                : route.label;
        items.push({
            tabName: canonical.tabName,
            path: route.path,
            label,
            order: route.order,
        });
    }

    return items.sort((a, b) => a.order - b.order);
}

export function hasVisibleTab(tabs: TabPermission[], tabName: string): boolean {
    const key = normalizeTabKey(tabName);
    const withoutSuffix = key.replace(/__c$/, "");
    const byPath = groupTabsByRoute(tabs);

    for (const [, group] of byPath) {
        const canonical = pickCanonicalTabPermission(group);
        if (!canonical || !isTabVisible(canonical)) {
            continue;
        }
        const tabKey = normalizeTabKey(canonical.tabName);
        const base = tabKey.replace(/__c$/, "");
        if (
            tabKey === key ||
            tabKey === withoutSuffix ||
            base === withoutSuffix ||
            base === key.replace(/__c$/, "")
        ) {
            return true;
        }
    }

    return false;
}

/** Full top navigation for setup administrators (pre-permissions UI). */
export const STANDARD_APP_NAV: NavItem[] = [
    { tabName: "home", path: "/home", label: "Home", order: 0 },
    { tabName: "account", path: "/accounts", label: "Accounts", order: 1 },
    { tabName: "contacts", path: "/contacts", label: "Contacts", order: 2 },
    { tabName: "projects", path: "/projects", label: "Projects", order: 3 },
    { tabName: "inventory", path: "/inventory", label: "Inventory", order: 4 },
    { tabName: "setup", path: "/setup", label: "Setup", order: 5 },
];

export function getDefaultNavPath(tabs: TabPermission[], isSetupAdmin = false): string {
    if (isSetupAdmin) {
        return "/home";
    }
    const navItems = buildNavItemsFromTabs(tabs);
    if (navItems.length === 0) {
        return "/home";
    }
    const homeItem = navItems.find((item) => normalizeTabKey(item.tabName) === "home");
    return homeItem?.path ?? navItems[0].path;
}
