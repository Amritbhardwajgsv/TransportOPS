const VARIANTS = {
    primary: 'bg-volt-400 text-volt-950 hover:brightness-95',
    ghost: 'bg-transparent text-smoke-100 border border-coal-600 hover:bg-coal-800',
    danger: 'bg-status-danger text-coal-950 hover:brightness-95',
};

export default function Button({ variant = 'primary', className = '', disabled, children, ...props }) {
    return (
        <button
            disabled={disabled}
            className={`focus-volt inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
