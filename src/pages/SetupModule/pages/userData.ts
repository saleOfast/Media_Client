export interface UserRow {
    id: string;
    user: string;
    username: string;
    email: string;
    department: string;
    profile: string;
    role: string;
    reportsTo: string;
    mobile: string;
    lastLogin: string;
    pwdStatus: "OK" | "Reset Required";
    status: "Active" | "Inactive";
}

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    department: string;
    profile: string;
    role: string;
    reportsTo: string;
}

const USER_STORAGE_KEY = "setup_user_list";

export const defaultUsers: UserRow[] = [
    {
        id: "USR-001",
        user: "Rahul Kumar",
        username: "rahul.k",
        email: "rahul.kumar@media.com",
        department: "Operations",
        profile: "Admin",
        role: "Super Admin",
        reportsTo: "Top Level (Root)",
        mobile: "+91 9820011111",
        lastLogin: "22-Apr-2026 10:35 AM",
        pwdStatus: "OK",
        status: "Active",
    },
    {
        id: "USR-002",
        user: "Sneha Joshi",
        username: "sneha.j",
        email: "sneha.joshi@media.com",
        department: "Sales",
        profile: "Manager",
        role: "Approver",
        reportsTo: "Abhay Sharma",
        mobile: "+91 9820022222",
        lastLogin: "21-Apr-2026 06:12 PM",
        pwdStatus: "Reset Required",
        status: "Active",
    },
    {
        id: "USR-003",
        user: "Dev Patil",
        username: "dev.p",
        email: "dev.patil@media.com",
        department: "Finance",
        profile: "Executive",
        role: "Editor",
        reportsTo: "Rahul Kumar",
        mobile: "+91 9820033333",
        lastLogin: "20-Apr-2026 11:04 AM",
        pwdStatus: "OK",
        status: "Inactive",
    },
    {
        id: "USR-004",
        user: "Mukul Kumar",
        username: "mukul.k",
        email: "mukul.kumar@media.com",
        department: "Admin",
        profile: "Support",
        role: "Viewer",
        reportsTo: "Rahul Kumar",
        mobile: "+91 9820044444",
        lastLogin: "19-Apr-2026 09:40 AM",
        pwdStatus: "Reset Required",
        status: "Active",
    },
];

export const loadUsers = (): UserRow[] => {
    const rawUsers = localStorage.getItem(USER_STORAGE_KEY);
    if (!rawUsers) {
        return defaultUsers;
    }

    try {
        const parsedUsers = JSON.parse(rawUsers) as UserRow[];
        return Array.isArray(parsedUsers) ? parsedUsers : defaultUsers;
    } catch {
        return defaultUsers;
    }
};

export const saveUsers = (users: UserRow[]) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
};

export const createUserEntry = (payload: CreateUserPayload): UserRow => {
    const userNumber = Math.floor(Math.random() * 900 + 100);
    const fullName = `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim();
    const username = `${payload.firstName.trim().toLowerCase()}.${payload.lastName.trim().charAt(0).toLowerCase()}`;

    return {
        id: `USR-${userNumber}`,
        user: fullName,
        username,
        email: payload.email.trim().toLowerCase(),
        department: payload.department,
        profile: payload.profile,
        role: payload.role || "Sales Lead",
        reportsTo: payload.reportsTo || "Abhay Sharma",
        mobile: payload.mobile.trim(),
        lastLogin: "-",
        pwdStatus: "Reset Required",
        status: "Active",
    };
};
