import { useEffect, useState } from 'react';
import { Plus, Fuel, Receipt } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Field, { Input, Select } from '../components/Field';
import EmptyState from '../components/EmptyState';

const EXPENSE_CATEGORIES = ['toll', 'parking', 'permit', 'insurance', 'fine', 'other'];

export default function Expenses() {
    const { showToast } = useToast();
    const [tab, setTab] = useState('fuel');
    const [vehicles, setVehicles] = useState([]);

    const [fuelLogs, setFuelLogs] = useState([]);
    const [fuelLoading, setFuelLoading] = useState(true);
    const [fuelModalOpen, setFuelModalOpen] = useState(false);
    const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: '', cost: '', odometerKm: '' });
    const [fuelError, setFuelError] = useState('');
    const [fuelSubmitting, setFuelSubmitting] = useState(false);

    const [expenses, setExpenses] = useState([]);
    const [expensesLoading, setExpensesLoading] = useState(true);
    const [expenseModalOpen, setExpenseModalOpen] = useState(false);
    const [expenseForm, setExpenseForm] = useState({ vehicleId: '', category: 'toll', description: '', cost: '' });
    const [expenseError, setExpenseError] = useState('');
    const [expenseSubmitting, setExpenseSubmitting] = useState(false);

    async function loadFuel() {
        setFuelLoading(true);
        try {
            const res = await api.get('/fuel-logs', { params: { limit: 20 } });
            setFuelLogs(res.data.logs);
        } finally {
            setFuelLoading(false);
        }
    }

    async function loadExpenses() {
        setExpensesLoading(true);
        try {
            const res = await api.get('/expenses', { params: { limit: 20 } });
            setExpenses(res.data.expenses);
        } finally {
            setExpensesLoading(false);
        }
    }

    async function loadVehicles() {
        const res = await api.get('/vehicles');
        setVehicles(res.data.vehicles);
    }

    useEffect(() => {
        loadFuel();
        loadExpenses();
        loadVehicles();
    }, []);

    async function handleFuelSubmit(e) {
        e.preventDefault();
        if (!fuelForm.vehicleId || !fuelForm.liters || fuelForm.cost === '') {
            setFuelError('Vehicle, liters and cost are required');
            return;
        }
        setFuelSubmitting(true);
        setFuelError('');
        try {
            await api.post('/fuel-logs', {
                vehicleId: fuelForm.vehicleId,
                liters: Number(fuelForm.liters),
                cost: Number(fuelForm.cost),
                odometerKm: fuelForm.odometerKm === '' ? null : Number(fuelForm.odometerKm),
            });
            showToast('Fuel log recorded', 'success');
            setFuelModalOpen(false);
            setFuelForm({ vehicleId: '', liters: '', cost: '', odometerKm: '' });
            loadFuel();
        } catch (err) {
            setFuelError(err.response?.data?.message ?? 'Something went wrong');
        } finally {
            setFuelSubmitting(false);
        }
    }

    async function handleExpenseSubmit(e) {
        e.preventDefault();
        if (expenseForm.cost === '') {
            setExpenseError('Cost is required');
            return;
        }
        setExpenseSubmitting(true);
        setExpenseError('');
        try {
            await api.post('/expenses', {
                vehicleId: expenseForm.vehicleId || null,
                category: expenseForm.category,
                description: expenseForm.description,
                cost: Number(expenseForm.cost),
            });
            showToast('Expense recorded', 'success');
            setExpenseModalOpen(false);
            setExpenseForm({ vehicleId: '', category: 'toll', description: '', cost: '' });
            loadExpenses();
        } catch (err) {
            setExpenseError(err.response?.data?.message ?? 'Something went wrong');
        } finally {
            setExpenseSubmitting(false);
        }
    }

    const fuelColumns = [
        { key: 'vehicle_registration', header: 'Vehicle', render: (l) => <span className="font-mono">{l.vehicle_registration}</span> },
        { key: 'liters', header: 'Liters', align: 'right', render: (l) => Number(l.liters).toLocaleString() },
        { key: 'cost', header: 'Cost', align: 'right', render: (l) => `₹${Number(l.cost).toLocaleString()}` },
        { key: 'odometer_km', header: 'Odometer', align: 'right', render: (l) => (l.odometer_km ? `${Number(l.odometer_km).toLocaleString()} km` : '—') },
        { key: 'logged_at', header: 'Date', render: (l) => new Date(l.logged_at).toLocaleDateString() },
    ];

    const expenseColumns = [
        { key: 'category', header: 'Category', render: (e) => <span className="capitalize">{e.category}</span> },
        { key: 'vehicle_registration', header: 'Vehicle', render: (e) => (e.vehicle_registration ? <span className="font-mono">{e.vehicle_registration}</span> : '—') },
        { key: 'description', header: 'Description', render: (e) => e.description ?? '—' },
        { key: 'cost', header: 'Cost', align: 'right', render: (e) => `₹${Number(e.cost).toLocaleString()}` },
        { key: 'logged_at', header: 'Date', render: (e) => new Date(e.logged_at).toLocaleDateString() },
    ];

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold text-smoke-100">Fuel &amp; Expenses</h1>
                    <p className="mt-1 text-sm text-smoke-400">Track fuel consumption and operational costs per vehicle.</p>
                </div>
                <Button onClick={() => (tab === 'fuel' ? setFuelModalOpen(true) : setExpenseModalOpen(true))}>
                    <Plus size={16} /> {tab === 'fuel' ? 'Log fuel' : 'Add expense'}
                </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:flex">
                <button
                    onClick={() => setTab('fuel')}
                    className={`focus-volt flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                        tab === 'fuel' ? 'bg-coal-800 text-volt-400' : 'text-smoke-400 hover:text-smoke-100'
                    }`}
                >
                    <Fuel size={16} /> Fuel
                </button>
                <button
                    onClick={() => setTab('expenses')}
                    className={`focus-volt flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                        tab === 'expenses' ? 'bg-coal-800 text-volt-400' : 'text-smoke-400 hover:text-smoke-100'
                    }`}
                >
                    <Receipt size={16} /> Expenses
                </button>
            </div>

            <div className="mt-4">
                {tab === 'fuel' ? (
                    <DataTable
                        columns={fuelColumns}
                        rows={fuelLogs}
                        loading={fuelLoading}
                        empty={<EmptyState icon={Fuel} title="No fuel logs yet" description="Log fuel purchases to track efficiency." />}
                    />
                ) : (
                    <DataTable
                        columns={expenseColumns}
                        rows={expenses}
                        loading={expensesLoading}
                        empty={<EmptyState icon={Receipt} title="No expenses yet" description="Add tolls, permits, fines and other costs here." />}
                    />
                )}
            </div>

            <Modal
                open={fuelModalOpen}
                onClose={() => setFuelModalOpen(false)}
                title="Log fuel"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setFuelModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleFuelSubmit} disabled={fuelSubmitting}>
                            {fuelSubmitting ? 'Saving…' : 'Log fuel'}
                        </Button>
                    </>
                }
            >
                <form className="space-y-4" onSubmit={handleFuelSubmit}>
                    <Field label="Vehicle">
                        <Select value={fuelForm.vehicleId} onChange={(e) => setFuelForm((f) => ({ ...f, vehicleId: e.target.value }))}>
                            <option value="">Select a vehicle…</option>
                            {vehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.registration_number} · {v.model}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Liters">
                            <Input type="number" min="0.1" step="0.1" value={fuelForm.liters} onChange={(e) => setFuelForm((f) => ({ ...f, liters: e.target.value }))} />
                        </Field>
                        <Field label="Cost (₹)">
                            <Input type="number" min="0" value={fuelForm.cost} onChange={(e) => setFuelForm((f) => ({ ...f, cost: e.target.value }))} />
                        </Field>
                    </div>
                    <Field label="Odometer at fill-up (km, optional)">
                        <Input type="number" min="0" value={fuelForm.odometerKm} onChange={(e) => setFuelForm((f) => ({ ...f, odometerKm: e.target.value }))} />
                    </Field>
                    {fuelError && <p className="text-sm text-status-danger">{fuelError}</p>}
                </form>
            </Modal>

            <Modal
                open={expenseModalOpen}
                onClose={() => setExpenseModalOpen(false)}
                title="Add expense"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setExpenseModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleExpenseSubmit} disabled={expenseSubmitting}>
                            {expenseSubmitting ? 'Saving…' : 'Add expense'}
                        </Button>
                    </>
                }
            >
                <form className="space-y-4" onSubmit={handleExpenseSubmit}>
                    <Field label="Category">
                        <Select value={expenseForm.category} onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}>
                            {EXPENSE_CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="Vehicle (optional)">
                        <Select value={expenseForm.vehicleId} onChange={(e) => setExpenseForm((f) => ({ ...f, vehicleId: e.target.value }))}>
                            <option value="">General / not vehicle-specific</option>
                            {vehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.registration_number} · {v.model}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="Description (optional)">
                        <Input value={expenseForm.description} onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))} />
                    </Field>
                    <Field label="Cost (₹)">
                        <Input type="number" min="0" value={expenseForm.cost} onChange={(e) => setExpenseForm((f) => ({ ...f, cost: e.target.value }))} />
                    </Field>
                    {expenseError && <p className="text-sm text-status-danger">{expenseError}</p>}
                </form>
            </Modal>
        </div>
    );
}
