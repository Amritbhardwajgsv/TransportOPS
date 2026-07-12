const ROLE_LABELS = {
    fleet_manager: 'Fleet Manager',
    driver: 'Driver',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
};

export default function RoleBadge({ role }) {
    return (
        <span className="inline-flex items-center rounded-full border border-coal-600 bg-coal-800 px-2 py-0.5 text-xs text-smoke-400">
            {ROLE_LABELS[role] ?? role}
        </span>
    );
}

export { ROLE_LABELS };
