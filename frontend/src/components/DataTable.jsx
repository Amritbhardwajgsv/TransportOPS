export default function DataTable({ columns, rows, keyField = 'id', onRowClick, loading, empty }) {
    if (loading) {
        return (
            <div className="overflow-hidden rounded-lg border border-coal-600">
                <table className="w-full text-sm">
                    <thead className="bg-coal-800 text-xs uppercase tracking-wider text-smoke-400">
                        <tr>
                            {columns.map((c) => (
                                <th key={c.key} className="px-4 py-2 text-left">
                                    {c.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="h-11 border-t border-coal-600">
                                {columns.map((c) => (
                                    <td key={c.key} className="px-4">
                                        <div className="h-3 w-3/4 animate-pulse rounded bg-coal-800" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!rows.length) {
        return empty ?? null;
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-coal-600">
            <table className="w-full text-sm">
                <thead className="bg-coal-800 text-xs uppercase tracking-wider text-smoke-400">
                    <tr>
                        {columns.map((c) => (
                            <th
                                key={c.key}
                                className={`whitespace-nowrap px-4 py-2 ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                            >
                                {c.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row[keyField]}
                            onClick={() => onRowClick?.(row)}
                            className={`h-11 border-t border-coal-600 ${onRowClick ? 'cursor-pointer hover:bg-coal-800' : ''}`}
                        >
                            {columns.map((c) => (
                                <td key={c.key} className={`px-4 ${c.align === 'right' ? 'text-right font-mono' : 'text-left'}`}>
                                    {c.render ? c.render(row) : row[c.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
