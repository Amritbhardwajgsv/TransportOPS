import { Truck, Route, ShieldCheck, Wallet } from 'lucide-react';

export const PUBLIC_ROLES = [
    {
        value: 'fleet_manager', slug: 'fleet-manager', icon: Truck, title: 'Fleet Manager', eyebrow: 'Control tower',
        description: 'Oversee fleet assets, maintenance, vehicle lifecycle, and operational efficiency.',
        capabilities: ['Manage vehicles and drivers', 'Oversee every trip', 'Close maintenance work', 'Review fleet-wide reports'],
        outcome: 'Keep every asset productive and every operation visible.',
    },
    {
        value: 'driver', slug: 'driver', icon: Route, title: 'Driver', eyebrow: 'Dispatch desk',
        description: 'Plan routes, dispatch eligible resources, and close active deliveries with accurate trip data.',
        capabilities: ['Create and dispatch trips', 'Use available resources only', 'Complete deliveries', 'Track active assignments'],
        outcome: 'Move work from planned to completed without resource conflicts.',
    },
    {
        value: 'safety_officer', slug: 'safety-officer', icon: ShieldCheck, title: 'Safety Officer', eyebrow: 'Compliance watch',
        description: 'Protect dispatch operations through license checks, suspensions, and safety monitoring.',
        capabilities: ['Prioritize license expiry', 'Suspend or reinstate drivers', 'Monitor safety scores', 'Block ineligible dispatch'],
        outcome: 'Keep non-compliant drivers off assignments automatically.',
    },
    {
        value: 'financial_analyst', slug: 'financial-analyst', icon: Wallet, title: 'Financial Analyst', eyebrow: 'Cost console',
        description: 'Understand fuel, maintenance, operating expenses, and efficiency across the fleet.',
        capabilities: ['Log fuel and expenses', 'Compare vehicle cost', 'Measure fuel efficiency', 'Export reporting data'],
        outcome: 'Turn daily operating records into clear cost decisions.',
    },
];

export function findPublicRole(identifier) {
    return PUBLIC_ROLES.find((role) => [role.value, role.slug, role.title].includes(identifier)) ?? PUBLIC_ROLES[0];
}
