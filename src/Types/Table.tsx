export interface Column<T> {
    title: string;
    dataIndex?: keyof T;
    render?: (value: T[keyof T] | undefined, row: T) => React.ReactNode;
}

export interface DynamicTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    emptyText?: string;
    rowKey: keyof T;
}