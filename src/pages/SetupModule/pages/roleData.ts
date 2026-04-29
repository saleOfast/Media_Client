export interface RoleRow {
    id: string;
    roleName: string;
    reportsTo: string;
    linkedProfile: string;
    assignedUsers: number;
    description: string;
    status: "Active" | "Inactive";
    updatedOn: string;
}

export interface CreateRolePayload {
    roleName: string;
    reportsTo: string;
    linkedProfile: string;
    description: string;
}

const ROLE_STORAGE_KEY = "setup_role_list";

export const defaultRoles: RoleRow[] = [
    {
        id: "ROLE-001",
        roleName: "Senior Sales Rep",
        reportsTo: "Sales Manager",
        linkedProfile: "Sales Profile",
        assignedUsers: 14,
        description: "Handles enterprise sales accounts and team coordination.",
        status: "Active",
        updatedOn: "22-Apr-2026",
    },
    {
        id: "ROLE-002",
        roleName: "Regional Operations Lead",
        reportsTo: "Operations Head",
        linkedProfile: "Operations Profile",
        assignedUsers: 8,
        description: "Owns site operations and SLA compliance.",
        status: "Active",
        updatedOn: "20-Apr-2026",
    },
    {
        id: "ROLE-003",
        roleName: "Finance Reviewer",
        reportsTo: "Finance Controller",
        linkedProfile: "Finance Profile",
        assignedUsers: 3,
        description: "Reviews budgets, invoices, and payment approvals.",
        status: "Inactive",
        updatedOn: "18-Apr-2026",
    },
];

export const loadRoles = (): RoleRow[] => {
    const rawRoles = localStorage.getItem(ROLE_STORAGE_KEY);
    if (!rawRoles) {
        return defaultRoles;
    }

    try {
        const parsedRoles = JSON.parse(rawRoles) as RoleRow[];
        return Array.isArray(parsedRoles) ? parsedRoles : defaultRoles;
    } catch {
        return defaultRoles;
    }
};

export const saveRoles = (roles: RoleRow[]) => {
    localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(roles));
};

export const createRoleEntry = (payload: CreateRolePayload): RoleRow => {
    const roleNumber = Math.floor(Math.random() * 900 + 100);
    return {
        id: `ROLE-${roleNumber}`,
        roleName: payload.roleName,
        reportsTo: payload.reportsTo,
        linkedProfile: payload.linkedProfile,
        assignedUsers: 0,
        description: payload.description || "-",
        status: "Active",
        updatedOn: new Date().toLocaleDateString("en-GB").replaceAll("/", "-"),
    };
};
