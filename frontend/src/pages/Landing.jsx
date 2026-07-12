import { useNavigate } from 'react-router-dom';
import { Truck, Route, ShieldCheck, Wallet } from 'lucide-react';
import TypewriterText from '../components/TypewriterText';
import Button from '../components/Button';
import { useInView } from '../hooks/useInView';

const ROLES = [
    {
        icon: Truck,
        title: 'Fleet Manager',
        description: 'Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency.',
        capabilities: [
            'Full CRUD on vehicles and drivers',
            'Dispatch and oversee every trip',
            'Log and close maintenance records',
            'All reports and cost breakdowns',
        ],
    },
    {
        icon: Route,
        title: 'Driver',
        description: 'Creates trips, assigns vehicles and drivers, and monitors active deliveries.',
        capabilities: [
            'Create and dispatch trips',
            'Pick from available vehicles and drivers only',
            'Complete and close out deliveries',
        ],
    },
    {
        icon: ShieldCheck,
        title: 'Safety Officer',
        description: 'Ensures driver compliance, tracks license validity, and monitors safety scores.',
        capabilities: [
            'License radar sorted by expiry',
            'Suspend and reinstate drivers',
            'Track safety scores fleet-wide',
        ],
    },
    {
        icon: Wallet,
        title: 'Financial Analyst',
        description: 'Reviews operational expenses, fuel consumption, maintenance costs, and profitability.',
        capabilities: [
            'Fuel and expense logging',
            'Cost-per-vehicle breakdowns',
            'Fuel efficiency reports with CSV export',
        ],
    },
];

function RoleSection({ icon: Icon, title, description, capabilities, reverse }) {
    const [ref, inView] = useInView({ threshold: 0.35 });

    return (
        <section
            ref={ref}
            className="page-boundary hazard-stripe flex min-h-screen items-center justify-center border-t border-coal-600 py-20"
            style={{ scrollSnapAlign: 'start' }}
        >
            <div className={`mx-auto flex w-full max-w-5xl flex-col items-center gap-12 md:flex-row ${reverse ? 'md:flex-row-reverse' : ''}`}>
                <div className={`reveal ${inView ? 'reveal-visible' : ''} flex-1 text-center md:text-left`}>
                    <Icon size={64} strokeWidth={1.5} className="mx-auto text-volt-400 md:mx-0" />
                    <h2 className="mt-4 font-display text-3xl font-semibold text-smoke-100 md:text-4xl">{title}</h2>
                    <p className="mt-3 max-w-md text-smoke-400">{description}</p>
                </div>
                <div
                    className={`reveal ${inView ? 'reveal-visible' : ''} flex-1`}
                    style={{ transitionDelay: inView ? '150ms' : '0ms' }}
                >
                    <ul className="space-y-3">
                        {capabilities.map((c) => (
                            <li
                                key={c}
                                className="flex items-center gap-3 rounded-lg border border-coal-600 bg-coal-900 px-4 py-3 text-sm text-smoke-100"
                            >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-volt-400" />
                                {c}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="h-screen overflow-y-auto bg-coal-950" style={{ scrollSnapType: 'y mandatory' }}>
            <section
                id="top"
                className="page-boundary hazard-stripe flex min-h-screen flex-col items-center justify-center gap-6 text-center"
                style={{ scrollSnapAlign: 'start' }}
            >
                <a href="#top" aria-label="Return to top" className="focus-volt flex items-center gap-2 rounded-md transition hover:text-volt-400">
                    <span className="h-2.5 w-2.5 bg-volt-400" />
                    <span className="font-display text-xl font-semibold tracking-wide text-smoke-100">TRANSITOPS</span>
                </a>
                <h1 className="max-w-3xl font-display text-4xl font-semibold text-smoke-100 md:text-6xl">
                    <TypewriterText text="Fleet operations, off the spreadsheet." />
                </h1>
                <p className="max-w-xl text-smoke-400">
                    One dashboard per role. Every business rule enforced automatically — not by trusting someone to
                    remember.
                </p>
                <Button onClick={() => navigate('/login')} className="mt-4">
                    Sign in
                </Button>
                <p className="mt-16 animate-bounce text-xs uppercase tracking-wider text-smoke-400">
                    Scroll to explore roles ↓
                </p>
            </section>

            {ROLES.map((role, i) => (
                <RoleSection key={role.title} {...role} reverse={i % 2 === 1} />
            ))}

            <section
                className="page-boundary flex min-h-screen flex-col items-center justify-center gap-6 border-t border-coal-600 text-center"
                style={{ scrollSnapAlign: 'start' }}
            >
                <h2 className="font-display text-3xl font-semibold text-smoke-100">Ready to get on the road?</h2>
                <p className="max-w-md text-smoke-400">Sign in with the account your fleet manager set up for you.</p>
                <Button onClick={() => navigate('/login')}>Sign in</Button>
            </section>
        </div>
    );
}
