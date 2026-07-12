export default function Field({ label, error, hint, children }) {
    return (
        <label className="block">
            <span className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wider text-smoke-400">
                {label}
                {hint}
            </span>
            {children}
            {error && <span className="mt-1 block text-xs text-status-danger">{error}</span>}
        </label>
    );
}

export function Input(props) {
    return (
        <input
            className="focus-volt h-10 w-full rounded-lg border border-coal-600 bg-coal-800 px-3 text-sm text-smoke-100 placeholder:text-smoke-400"
            {...props}
        />
    );
}

export function Select(props) {
    return (
        <select
            className="focus-volt h-10 w-full rounded-lg border border-coal-600 bg-coal-800 px-3 text-sm text-smoke-100"
            {...props}
        />
    );
}

export function Textarea(props) {
    return (
        <textarea
            className="focus-volt w-full rounded-lg border border-coal-600 bg-coal-800 px-3 py-2 text-sm text-smoke-100 placeholder:text-smoke-400"
            {...props}
        />
    );
}
