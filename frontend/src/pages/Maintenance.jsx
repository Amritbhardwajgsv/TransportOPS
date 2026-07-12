import { useEffect, useState } from 'react';
import { Plus, Wrench, Search } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Field, { Input, Select, Textarea } from '../components/Field';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const STATUS_FILTERS = ['open', 'closed'];

export default function Maintenance() {
    const { showToast } = useToast();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', description: '', cost: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/maintenance', { params });
            setRecords(res.data.records);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    async function openCreate() {
        setForm({ vehicleId: '', description: '', cost: '' });
        setError('');
        setModalOpen(true);
        const res = await api.get('/vehicles', { params: { status: 'available' } });
        setVehicles(res.data.vehicles);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.vehicleId || !form.description) {
            setError('Vehicle and description are required');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await api.post('/maintenance', {
                vehicleId: form.vehicleId,
                description: form.description,
                cost: form.cost === '' ? null : Number(form.cost),
            });
            showToast('Maintenance opened — vehicle is now In Shop', 'success');
            setModalOpen(false);
            load();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleClose(record) {
        try {
            await api.post(`/maintenance/${record.id}/close`);
            showToast(`Maintenance closed — ${record.vehicle_registration} is now Available`, 'success');
            load();
        } catch (err) {
            showToast(err.response?.data?.message ?? 'Something went wrong', 'error');
        }
    }

    const filteredRecords = search
        ? records.filter((r) =>
              `${r.vehicle_registration} ${r.description}`.toLowerCase().includes(search.toLowerCase())
          )
        : records;

    const columns = [
        {
            key: 'vehicle_registration',
            header: 'Vehicle',
            render: (r) => <span className="font-mono font-semibold">{r.vehicle_registration}</span>,
        },
        { key: 'description', header: 'Description' },
        {
            key: 'cost',
            header: 'Cost',
            align: 'right',
            sortValue: (r) => Number(r.cost ?? 0),
            render: (r) => (r.cost ? `₹${Number(r.cost).toLocaleString()}` : '—'),
        },
        {
            key: 'opened_at',
            header: 'Opened',
            sortValue: (r) => new Date(r.opened_at).getTime(),
            render: (r) => new Date(r.opened_at).toLocaleDateString(),
        },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        {
            key: 'actions',
            header: '',
            sortable: false,
            render: (r) =>
                r.status === 'open' ? (
                    <Button variant="ghost" className="h-8 px-3 text-xs" onClick={() => handleClose(r)}>
                        Close record
                    </Button>
                ) : (
                    <span className="text-smoke-400">—</span>
                ),
        },
    ];

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold text-smoke-100">Maintenance</h1>
                    <p className="mt-1 text-sm text-smoke-400">
                        Opening a record takes a vehicle off the road; closing it returns the vehicle to Available.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus size={16} /> Log maintenance
                </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-400" />
                    <input
                        className="focus-volt h-10 w-full rounded-lg border border-coal-600 bg-coal-800 pl-9 pr-3 text-sm text-smoke-100 placeholder:text-smoke-400"
                        placeholder="Search vehicle or description…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {STATUS_FILTERS.map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                        className={`focus-volt rounded-full border px-3 py-1 text-xs capitalize transition ${
                            statusFilter === s
                                ? 'border-volt-400 text-volt-400'
                                : 'border-coal-600 text-smoke-400 hover:text-smoke-100'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="mt-4">
                <DataTable
                    columns={columns}
                    rows={filteredRecords}
                    loading={loading}
                    empty={<EmptyState icon={Wrench} title="No maintenance records yet" description="Log a record when a vehicle needs servicing." />}
                />
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Log maintenance"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Saving…' : 'Log record'}
                        </Button>
                    </>
                }
            >
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Field label="Vehicle">
                        <Select value={form.vehicleId} onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}>
                            <option value="">Select a vehicle…</option>
                            {vehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.registration_number} · {v.model}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="Description">
                        <Textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        />
                    </Field>
                    <Field label="Estimated cost (₹)">
                        <Input type="number" min="0" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} />
                    </Field>
                    {error && <p className="text-sm text-status-danger">{error}</p>}
                </form>
            </Modal>
        </div>
    );
}
