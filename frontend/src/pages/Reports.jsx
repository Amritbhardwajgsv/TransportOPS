import { Download, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import Button from '../components/Button';
import InfoHint from '../components/InfoHint';
import EmptyState from '../components/EmptyState';

function downloadCsv(rows) {
    const header = ['Registration', 'Fuel cost', 'Fuel liters', 'Maintenance cost', 'Distance (km)', 'Efficiency (km/L)'];
    const lines = rows.map((v) => {
        const efficiency = v.fuel_liters > 0 ? (v.total_distance / v.fuel_liters).toFixed(1) : '0';
        return [v.registration_number, v.fuel_cost, v.fuel_liters, v.maintenance_cost, v.total_distance, efficiency].join(',');
    });
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transitops-cost-report.csv';
    a.click();
    URL.revokeObjectURL(url);
}

export default function Reports() {
    const { data, loading } = useDashboardSummary();

    if (loading || !data) {
        return <div className="text-smoke-400">Loading…</div>;
    }

    const perVehicle = data.costPerVehicle.map((v) => ({
        ...v,
        fuel_cost: Number(v.fuel_cost),
        fuel_liters: Number(v.fuel_liters),
        maintenance_cost: Number(v.maintenance_cost),
        total_distance: Number(v.total_distance),
    }));

    const efficiencyData = perVehicle
        .filter((v) => v.fuel_liters > 0)
        .map((v) => ({ name: v.registration_number, efficiency: Number((v.total_distance / v.fuel_liters).toFixed(1)) }));

    const costData = perVehicle.map((v) => ({ name: v.registration_number, fuel: v.fuel_cost, maintenance: v.maintenance_cost }));

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold text-smoke-100">Reports</h1>
                    <p className="mt-1 text-sm text-smoke-400">Fleet-wide cost and efficiency, computed from real trip and fuel data.</p>
                </div>
                <Button variant="ghost" onClick={() => downloadCsv(perVehicle)}>
                    <Download size={14} /> Export CSV
                </Button>
            </div>

            <div>
                <h2 className="mb-1 flex items-center gap-1 font-display text-lg font-semibold text-smoke-100">
                    Fuel efficiency per vehicle
                    <InfoHint text="Total distance driven on completed trips ÷ total liters logged for that vehicle" />
                </h2>
                {efficiencyData.length === 0 ? (
                    <EmptyState icon={BarChart3} title="No efficiency data yet" description="Complete trips and log fuel to see this chart." />
                ) : (
                    <div className="h-64 rounded-lg border border-coal-600 bg-coal-900 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={efficiencyData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" horizontal={false} />
                                <XAxis type="number" stroke="#a8a29e" fontSize={12} />
                                <YAxis type="category" dataKey="name" stroke="#a8a29e" fontSize={12} width={100} />
                                <Tooltip contentStyle={{ background: '#242424', border: '1px solid #3a3a3a', borderRadius: 8, color: '#edeae6' }} />
                                <Bar dataKey="efficiency" fill="#c6f432" name="km/L" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div>
                <h2 className="mb-1 flex items-center gap-1 font-display text-lg font-semibold text-smoke-100">
                    Cost per vehicle
                    <InfoHint text="Fuel cost (volt) stacked with maintenance cost (orange), all-time" />
                </h2>
                {costData.length === 0 ? (
                    <EmptyState icon={BarChart3} title="No cost data yet" />
                ) : (
                    <div className="h-64 rounded-lg border border-coal-600 bg-coal-900 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={costData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" vertical={false} />
                                <XAxis dataKey="name" stroke="#a8a29e" fontSize={12} />
                                <YAxis stroke="#a8a29e" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#242424', border: '1px solid #3a3a3a', borderRadius: 8, color: '#edeae6' }} />
                                <Bar dataKey="fuel" stackId="a" fill="#c6f432" name="Fuel" />
                                <Bar dataKey="maintenance" stackId="a" fill="#fb923c" name="Maintenance" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
