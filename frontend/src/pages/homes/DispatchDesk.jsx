import { useNavigate } from 'react-router-dom';
import { Route, Send, CheckCircle2 } from 'lucide-react';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import RoleHeroHeader from '../../components/RoleHeroHeader';
import RuleCallout from '../../components/RuleCallout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import DashboardGuide from '../../components/DashboardGuide';

export default function DispatchDesk() {
    const navigate = useNavigate();
    const { data, loading } = useDashboardSummary();

    if (loading || !data) {
        return <div className="text-smoke-400">Loading…</div>;
    }

    return (
        <div className="space-y-6">
            <RoleHeroHeader icon={Route} title="Dispatch Desk" description="Create trips, dispatch, and close them out." />

            <DashboardGuide
                description="This workspace guides a trip from route planning to completion while preventing unavailable drivers or vehicles from being assigned."
                steps={[
                    { label: 'Create the route', detail: 'Open New trip and enter the origin, destination, schedule, and expected cargo details.' },
                    { label: 'Assign and dispatch', detail: 'Choose from eligible vehicles and drivers. Only resources that are ready appear for assignment.' },
                    { label: 'Close the trip', detail: 'When delivery finishes, record the ending details and complete the trip to release its resources.' },
                ]}
                tip="The ready-now count tells you how many vehicles and drivers can be assigned before you begin creating a trip."
            />

            <button
                onClick={() => navigate('/trips')}
                className="focus-volt flex w-full items-center justify-between rounded-lg bg-volt-400 p-4 text-left text-volt-950 hover:brightness-95 sm:p-6"
            >
                <div>
                    <p className="font-display text-xl font-semibold">New trip</p>
                    <p className="text-sm">Register a route, pick a vehicle and driver, and dispatch.</p>
                </div>
                <Send size={32} strokeWidth={1.5} />
            </button>

            <div className="rounded-lg border border-coal-600 bg-coal-900 p-4 text-sm text-smoke-100">
                <span className="font-mono text-volt-400">{data.readyToRoll.vehicles}</span> vehicles ·{' '}
                <span className="font-mono text-volt-400">{data.readyToRoll.drivers}</span> drivers ready right now
            </div>

            <RuleCallout>
                Dispatching a trip sets the vehicle and driver to On Trip automatically; completing or cancelling releases
                them back to Available.
            </RuleCallout>

            <div>
                <h2 className="font-display text-lg font-semibold text-smoke-100">My active trips</h2>
                <p className="mb-3 mt-1 text-sm text-smoke-400">Trips currently dispatched and waiting to be completed or updated.</p>
                {data.activeTrips.length === 0 ? (
                    <EmptyState icon={Route} title="No active trips" description="Dispatch a trip to see it here." />
                ) : (
                    <div className="space-y-2">
                        {data.activeTrips.map((t) => (
                            <div
                                key={t.id}
                                className="flex flex-col items-stretch gap-3 rounded-lg border border-coal-600 bg-coal-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="text-sm text-smoke-100">
                                        {t.source} → {t.destination}
                                    </p>
                                    <p className="mt-1 font-mono text-xs text-smoke-400">
                                        {t.vehicle_registration} · {t.driver_name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={t.status} />
                                    <Button className="h-8 px-3 text-xs" onClick={() => navigate('/trips')}>
                                        <CheckCircle2 size={13} /> Complete trip
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
