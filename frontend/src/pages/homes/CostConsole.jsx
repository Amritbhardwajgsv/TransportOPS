import { useNavigate } from 'react-router-dom';
import { Wallet, Fuel, Receipt, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import RoleHeroHeader from '../../components/RoleHeroHeader';
import KpiCard from '../../components/KpiCard';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import EmptyState from '../../components/EmptyState';
import DashboardGuide from '../../components/DashboardGuide';

export default function CostConsole() {
    const navigate = useNavigate();
    const { data, loading } = useDashboardSummary();

    if (loading || !data) {
        return <div className="text-smoke-400">Loading…</div>;
    }

    const chartData = data.costPerVehicle.map((v) => ({
        name: v.registration_number,
        fuel: Number(v.fuel_cost),
        maintenance: Number(v.maintenance_cost),
    }));

    const fuelColumns = [
        { key: 'vehicle_registration', header: 'Vehicle', render: (l) => <span className="font-mono">{l.vehicle_registration}</span> },
        { key: 'liters', header: 'Liters', align: 'right', render: (l) => Number(l.liters).toLocaleString() },
        { key: 'cost', header: 'Cost', align: 'right', render: (l) => `₹${Number(l.cost).toLocaleString()}` },
    ];
    const expenseColumns = [
        { key: 'category', header: 'Category', render: (e) => <span className="capitalize">{e.category}</span> },
        { key: 'cost', header: 'Cost', align: 'right', render: (e) => `₹${Number(e.cost).toLocaleString()}` },
    ];

    return (
        <div className="space-y-6">
            <RoleHeroHeader icon={Wallet} title="Cost Console" description="Where the money goes, per vehicle and per liter." />

            <DashboardGuide
                description="Use this financial view to reconcile recent spending, compare vehicle cost profiles, and identify where operational efficiency is slipping."
                steps={[
                    { label: 'Check headline cost', detail: 'Review fuel, maintenance, total operational cost, and average efficiency for a fast financial health check.' },
                    { label: 'Compare vehicles', detail: 'The stacked chart separates fuel and maintenance so unusually expensive assets stand out.' },
                    { label: 'Verify and report', detail: 'Review recent logs, add missing costs, then open Reports for fleet-wide analysis and export.' },
                ]}
                tip="Fuel cost is month-based while the operational total can include all-time maintenance and expenses; use the metric hints for calculation details."
            />

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                <KpiCard label="Total fuel cost (month)" value={`₹${data.finance.totalFuelCostMonth.toLocaleString()}`} />
                <KpiCard label="Total maintenance cost" value={`₹${data.finance.totalMaintenanceCost.toLocaleString()}`} />
                <KpiCard
                    label="Total operational cost"
                    value={`₹${data.finance.totalOperationalCost.toLocaleString()}`}
                    hint="Fuel (this month) + maintenance + expenses, all-time"
                />
                <KpiCard
                    label="Avg fuel efficiency"
                    value={`${data.finance.avgFuelEfficiencyKmPerLiter} km/L`}
                    hint="Total distance on completed trips ÷ total liters logged"
                />
            </div>

            <div>
                <h2 className="font-display text-lg font-semibold text-smoke-100">Cost per vehicle</h2>
                <p className="mb-3 mt-1 text-sm text-smoke-400">Compare each vehicle's fuel and maintenance contribution to total fleet spend.</p>
                {chartData.length === 0 ? (
                    <EmptyState icon={BarChart3} title="No cost data yet" description="Log fuel or maintenance to see this chart." />
                ) : (
                    <div className="h-56 rounded-lg border border-coal-600 bg-coal-900 p-2 sm:h-64 sm:p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
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

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                    <h2 className="mb-3 font-display text-lg font-semibold text-smoke-100">Recent fuel logs</h2>
                    <DataTable columns={fuelColumns} rows={data.recentFuel} empty={<EmptyState icon={Fuel} title="No fuel logs yet" />} />
                </div>
                <div>
                    <h2 className="mb-3 font-display text-lg font-semibold text-smoke-100">Recent expenses</h2>
                    <DataTable columns={expenseColumns} rows={data.recentExpenses} empty={<EmptyState icon={Receipt} title="No expenses yet" />} />
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button variant="ghost" onClick={() => navigate('/expenses')}>
                    <Fuel size={14} /> Log fuel
                </Button>
                <Button variant="ghost" onClick={() => navigate('/expenses')}>
                    <Receipt size={14} /> Add expense
                </Button>
                <Button variant="ghost" onClick={() => navigate('/reports')}>
                    <BarChart3 size={14} /> Open reports
                </Button>
            </div>
        </div>
    );
}
