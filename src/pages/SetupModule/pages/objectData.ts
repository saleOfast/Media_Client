export interface ObjectRow {
    id: string;
    objectLabel: string;
    objectName: string;
    pluralLabel: string;
    description: string;
    tabIcon: string;
    createdOn: string;
}

export interface CreateObjectPayload {
    objectLabel: string;
    objectName: string;
    pluralLabel: string;
    description: string;
    tabIcon: string;
}

const OBJECT_STORAGE_KEY = "setup_object_list";

export const defaultObjects: ObjectRow[] = [
    {
        id: "OBJ-001",
        objectLabel: "Campaign",
        objectName: "Campaign__c",
        pluralLabel: "Campaigns",
        description: "Marketing campaign master object.",
        tabIcon: "Clipboard",
        createdOn: "22-Apr-2026",
    },
    {
        id: "OBJ-002",
        objectLabel: "Vendor",
        objectName: "Vendor__c",
        pluralLabel: "Vendors",
        description: "Stores all partner and vendor data.",
        tabIcon: "Building",
        createdOn: "21-Apr-2026",
    },
];

export const loadObjects = (): ObjectRow[] => {
    const rawObjects = localStorage.getItem(OBJECT_STORAGE_KEY);
    if (!rawObjects) {
        return defaultObjects;
    }

    try {
        const parsedObjects = JSON.parse(rawObjects) as ObjectRow[];
        return Array.isArray(parsedObjects) ? parsedObjects : defaultObjects;
    } catch {
        return defaultObjects;
    }
};

export const saveObjects = (objects: ObjectRow[]) => {
    localStorage.setItem(OBJECT_STORAGE_KEY, JSON.stringify(objects));
};

export const createObjectEntry = (payload: CreateObjectPayload): ObjectRow => {
    const objectNumber = Math.floor(Math.random() * 900 + 100);
    return {
        id: `OBJ-${objectNumber}`,
        objectLabel: payload.objectLabel,
        objectName: payload.objectName,
        pluralLabel: payload.pluralLabel,
        description: payload.description || "-",
        tabIcon: payload.tabIcon || "Clipboard",
        createdOn: new Date().toLocaleDateString("en-GB").replaceAll("/", "-"),
    };
};
