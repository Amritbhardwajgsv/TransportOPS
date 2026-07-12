export default function DataTable({ columns, rows, keyField = 'id', onRowClick, loading, empty }) {
    if (loading) {
        return (
            <div className="overflow-hidden rounded-lg border border-coal-600">
                <div className="space-y-3 p-3 sm:hidden">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-lg bg-coal-800" />)}
                </div>
                <table className="hidden w-full text-sm sm:table">
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
        <div className="rounded-lg border border-coal-600">
            <div className="divide-y divide-coal-600 sm:hidden">
                {rows.map((row) => (
                    <div
                        key={row[keyField]}
                        onClick={() => onRowClick?.(row)}
                        onKeyDown={(event) => {
                            if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
                                event.preventDefault();
                                onRowClick(row);
                            }
                        }}
                        role={onRowClick ? 'button' : undefined}
                        tabIndex={onRowClick ? 0 : undefined}
                        className={`block w-full space-y-2 p-4 text-left ${onRowClick ? 'cursor-pointer active:bg-coal-800' : ''}`}
                    >
                        {columns.map((c) => (
                            <div key={c.key} className="grid grid-cols-[minmax(5.5rem,0.8fr)_minmax(0,1.2fr)] items-start gap-3 text-sm">
                                <span className="text-xs uppercase tracking-wide text-smoke-400">{c.header}</span>
                                <span className={`min-w-0 break-words ${c.align === 'right' ? 'text-right font-mono' : 'text-right'}`}>
                                    {c.render ? c.render(row) : row[c.key]}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
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
        </div>
    );
}
