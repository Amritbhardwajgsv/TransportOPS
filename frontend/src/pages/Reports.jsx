import { useEffect, useState } from 'react';
import { Download, FileText, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import api from '../lib/api';
import Button from '../components/Button';
import InfoHint from '../components/InfoHint';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
    Available: '#4ade80',
    'On Trip': '#c6f432',
    'In Shop': '#fb923c',
    Retired: '#78716c',
};

const CATEGORY_COLORS = ['#c6f432', '#fb923c', '#4ade80', '#f87171', '#a78bfa', '#38bdf8'];

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
    const { user } = useAuth();
    const { data, loading } = useDashboardSummary();
    const [expenses, setExpenses] = useState([]);
    const [exportingPdf, setExportingPdf] = useState(false);

    useEffect(() => {
        api.get('/expenses', { params: { limit: 500 } }).then((res) => setExpenses(res.data.expenses));
    }, []);

    if (loading || !data) {
        return <div className="text-smoke-400">Loading…</div>;
    }

    const fleetStatusData = [
        { name: 'Available', value: data.vehicles.available },
        { name: 'On Trip', value: data.vehicles.onTrip },
        { name: 'In Shop', value: data.vehicles.inShop },
        { name: 'Retired', value: data.vehicles.retired },
    ].filter((d) => d.value > 0);

    const expensesByCategory = Object.entries(
        expenses.reduce((acc, e) => {
            const category = e.category.charAt(0).toUpperCase() + e.category.slice(1);
            acc[category] = (acc[category] ?? 0) + Number(e.cost);
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

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

    async function downloadPdf() {
        setExportingPdf(true);
        try {
            const { exportFleetPdf } = await import('../lib/exportFleetPdf');
            exportFleetPdf({ data, perVehicle, fleetStatusData, expensesByCategory, generatedBy: `${user.name} (${user.role.replaceAll('_', ' ')})` });
        } finally {
            setExportingPdf(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold text-smoke-100">Reports</h1>
                    <p className="mt-1 text-sm text-smoke-400">Fleet-wide cost and efficiency, computed from real trip and fuel data.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="ghost" onClick={() => downloadCsv(perVehicle)}>
                        <Download size={14} /> Export CSV
                    </Button>
                    <Button onClick={downloadPdf} disabled={exportingPdf}>
                        <FileText size={14} /> {exportingPdf ? 'Building PDF…' : 'Export PDF'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
                <div>
                    <h2 className="mb-1 flex items-center gap-1 font-display text-lg font-semibold text-smoke-100">
                        Fleet status distribution
                        <InfoHint text="Share of the fleet currently Available, On Trip, In Shop, or Retired" />
                    </h2>
                    {fleetStatusData.length === 0 ? (
                        <EmptyState icon={PieChartIcon} title="No vehicles yet" />
                    ) : (
                        <div className="h-64 min-w-0 rounded-lg border border-coal-600 bg-coal-900 p-2 sm:p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={fleetStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                                        {fleetStatusData.map((entry) => (
                                            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#a8a29e'} stroke="#1b1b1b" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#242424', border: '1px solid #3a3a3a', borderRadius: 8, color: '#edeae6' }} />
                                    <Legend wrapperStyle={{ fontSize: 12, color: '#a8a29e' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="mb-1 flex items-center gap-1 font-display text-lg font-semibold text-smoke-100">
                        Expenses by category
                        <InfoHint text="Total cost logged in Fuel & Expenses, grouped by category, all-time" />
                    </h2>
                    {expensesByCategory.length === 0 ? (
                        <EmptyState icon={PieChartIcon} title="No expenses yet" />
                    ) : (
                        <div className="h-64 min-w-0 rounded-lg border border-coal-600 bg-coal-900 p-2 sm:p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={expensesByCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                                        {expensesByCategory.map((entry, index) => (
                                            <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke="#1b1b1b" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#242424', border: '1px solid #3a3a3a', borderRadius: 8, color: '#edeae6' }}
                                        formatter={(value) => `₹${Number(value).toLocaleString()}`}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12, color: '#a8a29e' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h2 className="mb-1 flex items-center gap-1 font-display text-lg font-semibold text-smoke-100">
                    Fuel efficiency per vehicle
                    <InfoHint text="Total distance driven on completed trips ÷ total liters logged for that vehicle" />
                </h2>
                {efficiencyData.length === 0 ? (
                    <EmptyState icon={BarChart3} title="No efficiency data yet" description="Complete trips and log fuel to see this chart." />
                ) : (
                    <div className="h-56 rounded-lg border border-coal-600 bg-coal-900 p-2 sm:h-64 sm:p-4">
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
                    <div className="h-56 rounded-lg border border-coal-600 bg-coal-900 p-2 sm:h-64 sm:p-4">
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
