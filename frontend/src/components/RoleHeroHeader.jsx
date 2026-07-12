export default function RoleHeroHeader({ icon: Icon, title, description }) {
    return (
        <div className="hazard-stripe rounded-lg border border-coal-600 p-6">
            <Icon size={72} strokeWidth={1} className="text-volt-400" />
            <h1 className="mt-3 font-display text-2xl font-semibold text-smoke-100">{title}</h1>
            <p className="mt-1 text-sm text-smoke-400">{description}</p>
        </div>
    );
}
