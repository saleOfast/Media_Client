export type AuthUser = {
    id?: string;
    displayName: string;
    role?: string;
    identifier?: string;
    email?: string;
    phone?: string;
    department?: string;
    employeeId?: string;
    profileId?: string;
    roleId?: string;
    username?: string;
};

export type TabPermission = {
    tabName: string;
    tabLabel?: string;
    isVisible?: boolean;
    isDefaultNav?: boolean;
    defaultOn?: boolean;
};

export type TablePermission = {
    tableName: string;
    canRead?: boolean;
    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canWrite?: boolean;
};

export type FieldPermission = {
    id?: string;
    profileId?: string;
    tableName: string;
    fieldName: string;
    isMandatory: boolean;
    isReadOnly: boolean;
    isEditable: boolean;
};

export type UserPermissions = {
    profileId: string;
    cacheVersion: number;
    tabs: TabPermission[];
    tables: TablePermission[];
    fields: FieldPermission[];
    recordTypeAccess: unknown[];
};

export type AuthSession = {
    token: string;
    user: AuthUser;
    permissions: UserPermissions | null;
    /** From JWT `canSetup` — setup admins get full nav; field-only users do not */
    canSetup?: boolean;
};
