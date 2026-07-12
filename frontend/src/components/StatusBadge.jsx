const STATUS_STYLES = {
    available: { label: 'Available', color: '#4ade80' },
    on_trip: { label: 'On Trip', color: '#c6f432' },
    dispatched: { label: 'Dispatched', color: '#c6f432' },
    in_shop: { label: 'In Shop', color: '#fb923c' },
    open: { label: 'In Shop', color: '#fb923c' },
    draft: { label: 'Draft', color: '#e7b75f' },
    completed: { label: 'Completed', color: '#4ade80' },
    closed: { label: 'Closed', color: '#4ade80' },
    retired: { label: 'Retired', color: '#78716c' },
    suspended: { label: 'Suspended', color: '#78716c' },
    off_duty: { label: 'Off Duty', color: '#78716c' },
    cancelled: { label: 'Cancelled', color: '#78716c' },
    expired: { label: 'Expired', color: '#f87171' },
    blocked: { label: 'Blocked', color: '#f87171' },
};

export default function StatusBadge({ status, outline = false }) {
    const style = STATUS_STYLES[status] ?? { label: status, color: '#a8a29e' };
    return (
        <span
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={
                outline
                    ? { color: style.color, border: `1px solid ${style.color}`, background: 'transparent' }
                    : { color: style.color, background: `${style.color}1f` }
            }
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: style.color }} />
            {style.label}
        </span>
    );
}
