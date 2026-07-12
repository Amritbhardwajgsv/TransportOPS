import { useEffect, useState } from 'react';
import { Route, Send, CheckCircle2, XCircle } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Field, { Input, Select } from '../components/Field';
import StatusBadge from '../components/StatusBadge';
import RuleCallout from '../components/RuleCallout';
import EmptyState from '../components/EmptyState';

const STATUS_FILTERS = ['draft', 'dispatched', 'completed', 'cancelled'];

const emptyForm = {
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeightKg: '',
    plannedDistanceKm: '',
};

export default function Trips() {
    const { showToast } = useToast();

    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [formError, setFormError] = useState('');
    const [savingAs, setSavingAs] = useState(null);

    const [completeTrip, setCompleteTrip] = useState(null);
    const [completeForm, setCompleteForm] = useState({ endOdometerKm: '', fuelConsumedLiters: '' });
    const [completeError, setCompleteError] = useState('');
    const [completing, setCompleting] = useState(false);

    const [cancelTrip, setCancelTrip] = useState(null);

    async function load() {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/trips', { params });
            setTrips(res.data.trips);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    async function openCreate() {
        setForm(emptyForm);
        setFormError('');
        setModalOpen(true);
        const [vehiclesRes, driversRes] = await Promise.all([
            api.get('/vehicles', { params: { status: 'available' } }),
            api.get('/drivers', { params: { availableForDispatch: 'true' } }),
        ]);
        setAvailableVehicles(vehiclesRes.data.vehicles);
        setAvailableDrivers(driversRes.data.drivers);
    }

    const selectedVehicle = availableVehicles.find((v) => v.id === form.vehicleId);
    const cargoExceedsCapacity =
        selectedVehicle && form.cargoWeightKg && Number(form.cargoWeightKg) > Number(selectedVehicle.max_load_kg);

    async function handleSubmit(action) {
        setFormError('');
        if (!form.source || !form.destination || !form.vehicleId || !form.driverId || !form.cargoWeightKg) {
            setFormError('All fields except planned distance are required');
            return;
        }
        if (cargoExceedsCapacity) {
            return;
        }

        setSavingAs(action);
        try {
            const res = await api.post('/trips', {
                source: form.source,
                destination: form.destination,
                vehicleId: form.vehicleId,
                driverId: form.driverId,
                cargoWeightKg: Number(form.cargoWeightKg),
                plannedDistanceKm: form.plannedDistanceKm === '' ? null : Number(form.plannedDistanceKm),
                action,
            });
            const trip = res.data.trip;
            if (action === 'dispatch') {
                showToast(`Trip ${trip.trip_number} dispatched. Vehicle and driver are now On Trip.`, 'success');
            } else {
                showToast(`Trip ${trip.trip_number} saved as draft`, 'success');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            setFormError(err.response?.data?.message ?? 'Something went wrong');
        } finally {
            setSavingAs(null);
        }
    }

    async function handleDispatchExisting(trip) {
        try {
            await api.post(`/trips/${trip.id}/dispatch`);
            showToast(`Trip ${trip.trip_number} dispatched. Vehicle and driver are now On Trip.`, 'success');
            load();
        } catch (err) {
            showToast(err.response?.data?.message ?? 'Something went wrong', 'error');
        }
    }

    function openComplete(trip) {
        setCompleteTrip(trip);
        setCompleteForm({ endOdometerKm: '', fuelConsumedLiters: '' });
        setCompleteError('');
    }

    const endOdometerInvalid =
        completeTrip &&
        completeForm.endOdometerKm !== '' &&
        Number(completeForm.endOdometerKm) <= Number(completeTrip.start_odometer_km);

    async function handleComplete(e) {
        e.preventDefault();
        if (endOdometerInvalid || completeForm.endOdometerKm === '') {
            return;
        }
        setCompleting(true);
        setCompleteError('');
        try {
            await api.post(`/trips/${completeTrip.id}/complete`, {
                endOdometerKm: Number(completeForm.endOdometerKm),
                fuelConsumedLiters: completeForm.fuelConsumedLiters === '' ? null : Number(completeForm.fuelConsumedLiters),
            });
            showToast(`Trip ${completeTrip.trip_number} completed. Vehicle and driver are Available again.`, 'success');
            setCompleteTrip(null);
            load();
        } catch (err) {
            setCompleteError(err.response?.data?.message ?? 'Something went wrong');
        } finally {
            setCompleting(false);
        }
    }

    async function handleCancel() {
        try {
            await api.post(`/trips/${cancelTrip.id}/cancel`);
            showToast(`Trip ${cancelTrip.trip_number} cancelled.`, 'info');
            setCancelTrip(null);
            load();
        } catch (err) {
            showToast(err.response?.data?.message ?? 'Something went wrong', 'error');
        }
    }

    const columns = [
        { key: 'trip_number', header: 'Trip', render: (t) => <span className="font-mono font-semibold">{t.trip_number}</span> },
        { key: 'route', header: 'Route', render: (t) => `${t.source} → ${t.destination}` },
        {
            key: 'vehicle',
            header: 'Vehicle',
            render: (t) => <span className="font-mono">{t.vehicle_registration}</span>,
        },
        { key: 'driver_name', header: 'Driver' },
        { key: 'cargo_weight_kg', header: 'Cargo', align: 'right', render: (t) => `${Number(t.cargo_weight_kg).toLocaleString()} kg` },
        { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
        {
            key: 'actions',
            header: '',
            render: (t) => (
                <div className="flex justify-end gap-2">
                    {t.status === 'draft' && (
                        <>
                            <Button variant="ghost" className="h-8 px-3 text-xs" onClick={() => handleDispatchExisting(t)}>
                                <Send size={13} /> Dispatch
                            </Button>
                            <Button variant="danger" className="h-8 px-3 text-xs" onClick={() => setCancelTrip(t)}>
                                <XCircle size={13} /> Cancel
                            </Button>
                        </>
                    )}
                    {t.status === 'dispatched' && (
                        <>
                            <Button className="h-8 px-3 text-xs" onClick={() => openComplete(t)}>
                                <CheckCircle2 size={13} /> Complete
                            </Button>
                            <Button variant="danger" className="h-8 px-3 text-xs" onClick={() => setCancelTrip(t)}>
                                <XCircle size={13} /> Cancel
                            </Button>
                        </>
                    )}
                    {['completed', 'cancelled'].includes(t.status) && <span className="text-smoke-400">—</span>}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold text-smoke-100">Trips</h1>
                    <p className="mt-1 text-sm text-smoke-400">Create, dispatch, and close out trips across the fleet.</p>
                </div>
                <Button onClick={openCreate}>
                    <Route size={16} /> New trip
                </Button>
            </div>

            <div className="mt-4">
                <RuleCallout>
                    Only Available vehicles and valid-license drivers are listed below. Dispatching sets both to On Trip
                    automatically; completing or cancelling releases them back to Available.
                </RuleCallout>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
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
                    rows={trips}
                    loading={loading}
                    empty={<EmptyState icon={Route} title="No trips yet" description="Create a trip to get the fleet moving." />}
                />
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="New trip"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="ghost"
                            disabled={savingAs !== null || cargoExceedsCapacity}
                            onClick={() => handleSubmit('draft')}
                        >
                            {savingAs === 'draft' ? 'Saving…' : 'Save as draft'}
                        </Button>
                        <Button disabled={savingAs !== null || cargoExceedsCapacity} onClick={() => handleSubmit('dispatch')}>
                            <Send size={14} /> {savingAs === 'dispatch' ? 'Dispatching…' : 'Dispatch'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Source">
                            <Input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
                        </Field>
                        <Field label="Destination">
                            <Input
                                value={form.destination}
                                onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                            />
                        </Field>
                    </div>

                    <Field label="Vehicle">
                        <Select value={form.vehicleId} onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}>
                            <option value="">Select an available vehicle…</option>
                            {availableVehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.registration_number} · {v.model} · {Number(v.max_load_kg).toLocaleString()} kg
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Driver">
                        <Select value={form.driverId} onChange={(e) => setForm((f) => ({ ...f, driverId: e.target.value }))}>
                            <option value="">Select an available driver…</option>
                            {availableDrivers.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name} · license expires {new Date(d.license_expiry).toLocaleDateString()}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            label="Cargo weight (kg)"
                            error={cargoExceedsCapacity ? `Cargo ${Number(form.cargoWeightKg).toLocaleString()} kg exceeds capacity (${Number(selectedVehicle.max_load_kg).toLocaleString()} kg)` : undefined}
                        >
                            <Input
                                type="number"
                                min="1"
                                value={form.cargoWeightKg}
                                onChange={(e) => setForm((f) => ({ ...f, cargoWeightKg: e.target.value }))}
                            />
                        </Field>
                        <Field label="Planned distance (km)">
                            <Input
                                type="number"
                                min="0"
                                value={form.plannedDistanceKm}
                                onChange={(e) => setForm((f) => ({ ...f, plannedDistanceKm: e.target.value }))}
                            />
                        </Field>
                    </div>

                    {formError && <p className="text-sm text-status-danger">{formError}</p>}
                </div>
            </Modal>

            <Modal
                open={!!completeTrip}
                onClose={() => setCompleteTrip(null)}
                title={`Complete ${completeTrip?.trip_number ?? ''}`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setCompleteTrip(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleComplete} disabled={completing || endOdometerInvalid || completeForm.endOdometerKm === ''}>
                            <CheckCircle2 size={14} /> {completing ? 'Completing…' : 'Complete trip'}
                        </Button>
                    </>
                }
            >
                {completeTrip && (
                    <form className="space-y-4" onSubmit={handleComplete}>
                        <p className="text-sm text-smoke-400">
                            Start odometer was <span className="font-mono text-smoke-100">{Number(completeTrip.start_odometer_km).toLocaleString()} km</span>.
                        </p>
                        <Field
                            label="Final odometer (km)"
                            error={endOdometerInvalid ? `Must be greater than ${Number(completeTrip.start_odometer_km).toLocaleString()} km` : undefined}
                        >
                            <Input
                                type="number"
                                value={completeForm.endOdometerKm}
                                onChange={(e) => setCompleteForm((f) => ({ ...f, endOdometerKm: e.target.value }))}
                                required
                            />
                        </Field>
                        <Field label="Fuel consumed (liters)">
                            <Input
                                type="number"
                                step="0.1"
                                value={completeForm.fuelConsumedLiters}
                                onChange={(e) => setCompleteForm((f) => ({ ...f, fuelConsumedLiters: e.target.value }))}
                            />
                        </Field>
                        {completeError && <p className="text-sm text-status-danger">{completeError}</p>}
                    </form>
                )}
            </Modal>

            <ConfirmDialog
                open={!!cancelTrip}
                onClose={() => setCancelTrip(null)}
                onConfirm={handleCancel}
                title="Cancel trip"
                description={`${cancelTrip?.trip_number ?? ''} will be cancelled${cancelTrip?.status === 'dispatched' ? '. The vehicle and driver will be released back to Available.' : '.'}`}
                confirmLabel="Cancel trip"
            />
        </div>
    );
}
