export default function EmptyState({ icon: Icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-coal-600 py-16 text-center">
            <Icon size={48} className="text-smoke-400" strokeWidth={1.5} />
            <p className="font-display text-lg text-smoke-100">{title}</p>
            {description && <p className="max-w-sm text-sm text-smoke-400">{description}</p>}
        </div>
    );
}
