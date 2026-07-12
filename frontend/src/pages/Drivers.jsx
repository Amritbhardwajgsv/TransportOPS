import { useEffect, useState } from 'react';
import { Plus, UserRound, Search, TriangleAlert } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Drawer from '../components/Drawer';
import ConfirmDialog from '../components/ConfirmDialog';
import Field, { Input } from '../components/Field';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { fileToBase64 } from '../lib/fileToBase64';

const STATUS_FILTERS = ['available', 'on_trip', 'off_duty', 'suspended'];
const MAX_PHOTO_BYTES = 250000;

const emptyForm = { name: '', licenseNumber: '', licenseExpiry: '', safetyScore: 100, photo: null };

function ExpiryLabel({ driver }) {
    const days = driver.days_until_expiry;
    const dateLabel = new Date(driver.license_expiry).toLocaleDateString();
    if (driver.is_expired) {
        return (
            <span className="inline-flex items-center gap-1 font-mono text-status-danger">
                <TriangleAlert size={13} /> {dateLabel}
            </span>
        );
    }
    if (days <= 30) {
        return <span className="font-mono text-status-draft">{dateLabel}</span>;
    }
    return <span className="font-mono text-smoke-100">{dateLabel}</span>;
}

export default function Drivers() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const canManage = user.role === 'fleet_manager';
    const canEditCompliance = user.role === 'fleet_manager' || user.role === 'safety_officer';

    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [fieldError, setFieldError] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const [drawerDriver, setDrawerDriver] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    async function load() {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/drivers', { params });
            setDrivers(res.data.drivers);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, statusFilter]);

    function openCreate() {
        setEditing(null);
        setForm(emptyForm);
        setFieldError({});
        setModalOpen(true);
    }

    function openEdit(driver) {
        setEditing(driver);
        setForm({
            name: driver.name,
            licenseNumber: driver.license_number,
            licenseExpiry: driver.license_expiry.slice(0, 10),
            safetyScore: driver.safety_score,
            photo: driver.photo,
        });
        setFieldError({});
        setModalOpen(true);
        setDrawerDriver(null);
    }

    async function handlePhotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > MAX_PHOTO_BYTES) {
            setFieldError((f) => ({ ...f, photo: 'Image must be under ~200KB' }));
            return;
        }
        const base64 = await fileToBase64(file);
        setForm((f) => ({ ...f, photo: base64 }));
        setFieldError((f) => ({ ...f, photo: undefined }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name: form.name,
                licenseNumber: form.licenseNumber.trim().toUpperCase(),
                licenseExpiry: form.licenseExpiry,
                safetyScore: Number(form.safetyScore),
                photo: form.photo,
            };
            if (editing) {
                await api.put(`/drivers/${editing.id}`, payload);
                showToast(`Driver ${payload.name} updated`, 'success');
            } else {
                await api.post('/drivers', payload);
                showToast(`Driver ${payload.name} added`, 'success');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            if (err.response?.status === 409) {
                setFieldError({ licenseNumber: err.response.data.message });
            } else {
                showToast(err.response?.data?.message ?? 'Something went wrong', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleConfirmAction() {
        const { driver, type } = confirmAction;
        try {
            await api.post(`/drivers/${driver.id}/${type}`);
            showToast(
                type === 'suspend' ? `${driver.name} suspended — no longer eligible for dispatch` : `${driver.name} reinstated`,
                'success'
            );
            setConfirmAction(null);
            setDrawerDriver(null);
            load();
        } catch (err) {
            showToast(err.response?.data?.message ?? 'Something went wrong', 'error');
        }
    }

    const columns = [
        { key: 'photo', header: '', render: (d) => <Avatar photo={d.photo} name={d.name} /> },
        { key: 'name', header: 'Name' },
        { key: 'license_number', header: 'License', render: (d) => <span className="font-mono">{d.license_number}</span> },
        { key: 'license_expiry', header: 'Expires', render: (d) => <ExpiryLabel driver={d} /> },
        {
            key: 'safety_score',
            header: 'Safety score',
            align: 'right',
            render: (d) => <span className={d.safety_score < 50 ? 'text-status-danger' : ''}>{d.safety_score}</span>,
        },
        { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
    ];

    return (
        <div>
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold text-smoke-100">Drivers</h1>
                    <p className="mt-1 text-sm text-smoke-400">
                        Track license validity and safety scores. Suspended or expired drivers never appear in dispatch.
                    </p>
                </div>
                {canManage && (
                    <Button onClick={openCreate}>
                        <Plus size={16} /> Add driver
                    </Button>
                )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-400" />
                    <input
                        className="focus-volt h-10 w-full rounded-lg border border-coal-600 bg-coal-800 pl-9 pr-3 text-sm text-smoke-100 placeholder:text-smoke-400"
                        placeholder="Search name or license…"
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
                        {s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="mt-4">
                <DataTable
                    columns={columns}
                    rows={drivers}
                    loading={loading}
                    onRowClick={setDrawerDriver}
                    empty={
                        <EmptyState
                            icon={UserRound}
                            title="No drivers yet"
                            description={canManage ? 'Add a driver to start assigning trips.' : 'No drivers match your search.'}
                        />
                    }
                />
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit driver' : 'Add driver'}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Saving…' : 'Save driver'}
                        </Button>
                    </>
                }
            >
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Field label="Name">
                        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                    </Field>
                    <Field label="License number" error={fieldError.licenseNumber}>
                        <Input
                            value={form.licenseNumber}
                            onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                            required
                            disabled={!canManage && Boolean(editing)}
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="License expiry">
                            <Input
                                type="date"
                                value={form.licenseExpiry}
                                onChange={(e) => setForm((f) => ({ ...f, licenseExpiry: e.target.value }))}
                                required
                            />
                        </Field>
                        <Field label="Safety score">
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={form.safetyScore}
                                onChange={(e) => setForm((f) => ({ ...f, safetyScore: e.target.value }))}
                            />
                        </Field>
                    </div>
                    <Field label="Photo (optional)" error={fieldError.photo}>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm text-smoke-400" />
                        {form.photo && <img src={form.photo} alt="" className="mt-2 h-24 w-24 rounded-full object-cover" />}
                    </Field>
                </form>
            </Modal>

            <Drawer open={!!drawerDriver} onClose={() => setDrawerDriver(null)} title={drawerDriver?.name ?? ''}>
                {drawerDriver && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <Avatar photo={drawerDriver.photo} name={drawerDriver.name} size={64} />
                            <div>
                                <p className="font-display text-lg text-smoke-100">{drawerDriver.name}</p>
                                <StatusBadge status={drawerDriver.status} />
                            </div>
                        </div>

                        <dl className="grid grid-cols-2 gap-y-3 text-sm">
                            <dt className="text-smoke-400">License</dt>
                            <dd className="text-right font-mono">{drawerDriver.license_number}</dd>
                            <dt className="text-smoke-400">Expires</dt>
                            <dd className="text-right">
                                <ExpiryLabel driver={drawerDriver} />
                            </dd>
                        </dl>

                        <div>
                            <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wider text-smoke-400">
                                <span>Safety score</span>
                                <span className="font-mono">{drawerDriver.safety_score}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-coal-800">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${drawerDriver.safety_score}%`,
                                        background: drawerDriver.safety_score < 50 ? '#f87171' : '#c6f432',
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {canManage && (
                                <Button variant="ghost" className="flex-1" onClick={() => openEdit(drawerDriver)}>
                                    Edit
                                </Button>
                            )}
                            {canEditCompliance && drawerDriver.status !== 'suspended' && (
                                <Button
                                    variant="danger"
                                    className="flex-1"
                                    onClick={() => setConfirmAction({ driver: drawerDriver, type: 'suspend' })}
                                >
                                    Suspend
                                </Button>
                            )}
                            {canEditCompliance && drawerDriver.status === 'suspended' && (
                                <Button className="flex-1" onClick={() => setConfirmAction({ driver: drawerDriver, type: 'reinstate' })}>
                                    Reinstate
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Drawer>

            <ConfirmDialog
                open={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirmAction}
                title={confirmAction?.type === 'suspend' ? 'Suspend driver' : 'Reinstate driver'}
                description={
                    confirmAction?.type === 'suspend'
                        ? `${confirmAction?.driver.name} will be blocked from dispatch until reinstated.`
                        : `${confirmAction?.driver.name} will become eligible for dispatch again.`
                }
                confirmLabel={confirmAction?.type === 'suspend' ? 'Suspend' : 'Reinstate'}
                variant={confirmAction?.type === 'suspend' ? 'danger' : 'primary'}
            />
        </div>
    );
}
