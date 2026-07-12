import InfoHint from './InfoHint';

export default function KpiCard({ label, value, hint, accent = false, children }) {
    return (
        <div className="min-w-0 rounded-lg border border-coal-600 bg-coal-900 p-3 sm:p-4">
            <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-smoke-400">
                {label}
                {hint && <InfoHint text={hint} />}
            </div>
            <div className={`mt-1 break-words font-mono text-2xl sm:text-3xl ${accent ? 'text-volt-400' : 'text-smoke-100'}`}>{value}</div>
            {children}
        </div>
    );
}
