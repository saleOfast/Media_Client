import type { DynamicTableProps } from "../Types/Table";


const DynamicTable = <T,>({
    columns,
    data,
    loading = false,
    emptyText = "No Data Found",
    rowKey,
}: DynamicTableProps<T>) => {
    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-[11px]">

                    {/* HEADER */}
                    <thead className="bg-slate-100/60 text-black/80">
                        <tr>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className="px-3 py-1.5 text-left font-semibold border-b border-slate-200"
                                >
                                    {col.title}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {loading ? (
                            <tr
                                className="border-b border-slate-100"
                            >
                                <td colSpan={columns.length} className="text-center py-6 text-slate-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((row) => (
                                <tr
                                    key={String(row[rowKey])}
                                    className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors"
                                >
                                    {columns.map((col, j) => (
                                        <td key={j} className="px-3 py-1.5 align-middle text-black/80">
                                            {col.render
                                                ? col.render(
                                                    col.dataIndex ? row[col.dataIndex] : undefined,
                                                    row
                                                )
                                                : col.dataIndex
                                                    ? String(row[col.dataIndex])
                                                    : null}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-8 text-slate-400"
                                >
                                    {emptyText}
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default DynamicTable;