import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, UserRound, Route, Wrench } from 'lucide-react';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import api from '../../lib/api';
import RoleHeroHeader from '../../components/RoleHeroHeader';
import KpiCard from '../../components/KpiCard';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import PhotoThumb from '../../components/PhotoThumb';
import EmptyState from '../../components/EmptyState';

export default function FleetCommand() {
    const navigate = useNavigate();
    const { data, loading } = useDashboardSummary();
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        api.get('/vehicles').then((res) => setVehicles(res.data.vehicles.slice(0, 8)));
    }, []);

    if (loading || !data) {
        return <div className="text-smoke-400">Loading…</div>;
    }

    const activeVehicles = data.vehicles.available + data.vehicles.onTrip + data.vehicles.inShop;

    const tripColumns = [
        { key: 'trip_number', header: 'Trip', render: (t) => <span className="font-mono font-semibold">{t.trip_number}</span> },
        { key: 'route', header: 'Route', render: (t) => `${t.source} → ${t.destination}` },
        { key: 'vehicle_registration', header: 'Vehicle', render: (t) => <span className="font-mono">{t.vehicle_registration}</span> },
        { key: 'driver_name', header: 'Driver' },
        { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    ];

    const noAttention =
        data.attention.expiredLicenses.length === 0 &&
        data.attention.vehiclesInShop.length === 0 &&
        data.attention.staleDrafts.length === 0;

    return (
        <div className="space-y-6">
            <RoleHeroHeader icon={Truck} title="Fleet Command" description="Everything on the road, in the shop, and in between." />

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-7">
                <KpiCard label="Active vehicles" value={activeVehicles} />
                <KpiCard label="Available" value={data.vehicles.available} />
                <KpiCard label="In maintenance" value={data.vehicles.inShop} />
                <KpiCard label="Active trips" value={data.trips.dispatched} />
                <KpiCard label="Draft trips" value={data.trips.draft} />
                <KpiCard label="Drivers on duty" value={data.drivers.onTrip} />
                <KpiCard label="Fleet utilization" value={`${data.fleetUtilizationPct}%`} hint="On-Trip vehicles ÷ active fleet" accent>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-coal-800">
                        <div className="h-full rounded-full bg-volt-400" style={{ width: `${data.fleetUtilizationPct}%` }} />
                    </div>
                </KpiCard>
            </div>

            <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-smoke-100">Fleet board</h2>
                {vehicles.length === 0 ? (
                    <EmptyState icon={Truck} title="No vehicles yet" description="Add your first vehicle to get the fleet on the road." />
                ) : (
                    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                        {vehicles.map((v) => (
                            <button
                                key={v.id}
                                onClick={() => navigate('/vehicles')}
                                className="focus-volt flex items-center gap-3 rounded-lg border border-coal-600 bg-coal-900 p-3 text-left hover:bg-coal-800"
                            >
                                <PhotoThumb photo={v.photo} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-mono text-sm font-semibold text-smoke-100">{v.registration_number}</p>
                                    <p className="truncate text-xs text-smoke-400">{v.model}</p>
                                </div>
                                <StatusBadge status={v.status} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <h2 className="mb-3 font-display text-lg font-semibold text-smoke-100">Active trips</h2>
                    <DataTable
                        columns={tripColumns}
                        rows={data.activeTrips}
                        empty={<EmptyState icon={Route} title="No active trips" description="Dispatch a trip to see it here." />}
                    />
                </div>
                <div>
                    <h2 className="mb-3 font-display text-lg font-semibold text-smoke-100">Needs attention</h2>
                    <div className="space-y-2">
                        {data.attention.expiredLicenses.map((d) => (
                            <div key={d.id} className="rounded-lg border border-coal-600 bg-coal-900 p-3 text-sm text-smoke-100">
                                <span className="text-status-danger">Expired license</span> — {d.name}
                            </div>
                        ))}
                        {data.attention.vehiclesInShop.map((v) => (
                            <div key={v.id} className="rounded-lg border border-coal-600 bg-coal-900 p-3 text-sm text-smoke-100">
                                <span className="text-status-shop">In shop</span> — <span className="font-mono">{v.registration_number}</span>
                            </div>
                        ))}
                        {data.attention.staleDrafts.map((t) => (
                            <div key={t.id} className="rounded-lg border border-coal-600 bg-coal-900 p-3 text-sm text-smoke-100">
                                <span className="text-status-draft">Stale draft</span> — {t.trip_number}
                            </div>
                        ))}
                        {noAttention && <p className="text-sm text-smoke-400">Nothing needs attention right now.</p>}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button variant="ghost" onClick={() => navigate('/vehicles')}>
                    <Plus size={14} /> Add vehicle
                </Button>
                <Button variant="ghost" onClick={() => navigate('/drivers')}>
                    <UserRound size={14} /> Add driver
                </Button>
                <Button variant="ghost" onClick={() => navigate('/trips')}>
                    <Route size={14} /> New trip
                </Button>
                <Button variant="ghost" onClick={() => navigate('/maintenance')}>
                    <Wrench size={14} /> Log maintenance
                </Button>
            </div>
        </div>
    );
}
