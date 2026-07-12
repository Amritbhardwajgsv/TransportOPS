import { useEffect, useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Field, { Input } from '../components/Field';
import InfoHint from '../components/InfoHint';
import EmptyState from '../components/EmptyState';

const emptyForm = { name: '', lat: '', lng: '' };

export default function Cities() {
    const { showToast } = useToast();
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const res = await api.get('/cities');
            setCities(res.data.cities);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    function openCreate() {
        setForm(emptyForm);
        setError('');
        setModalOpen(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || form.lat === '' || form.lng === '') {
            setError('Name, latitude and longitude are all required');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await api.post('/cities', { name: form.name.trim(), lat: Number(form.lat), lng: Number(form.lng) });
            showToast(`${form.name.trim()} added — now available in Trips and Vehicles location fields`, 'success');
            setModalOpen(false);
            load();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    }

    const columns = [
        { key: 'name', header: 'Depot' },
        { key: 'lat', header: 'Latitude', align: 'right', render: (c) => Number(c.lat).toFixed(4) },
        { key: 'lng', header: 'Longitude', align: 'right', render: (c) => Number(c.lng).toFixed(4) },
    ];

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold text-smoke-100">Depots</h1>
                    <p className="mt-1 text-sm text-smoke-400">
                        The cities available across Trips and Vehicles location fields. Add a depot here and it shows up
                        everywhere immediately — no code change needed.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus size={16} /> Add depot
                </Button>
            </div>

            <div className="mt-6">
                <DataTable
                    columns={columns}
                    rows={cities}
                    loading={loading}
                    empty={<EmptyState icon={MapPin} title="No depots yet" description="Add your first depot city to start routing trips." />}
                />
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Add depot"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Saving…' : 'Save depot'}
                        </Button>
                    </>
                }
            >
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Field label="City name">
                        <Input
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Kolhapur"
                            required
                        />
                    </Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field
                            label="Latitude"
                            hint={<InfoHint text="Right-click the location on Google Maps and copy the first number shown" />}
                        >
                            <Input
                                type="number"
                                step="0.0001"
                                min="-90"
                                max="90"
                                value={form.lat}
                                onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                                placeholder="16.7050"
                                required
                            />
                        </Field>
                        <Field label="Longitude">
                            <Input
                                type="number"
                                step="0.0001"
                                min="-180"
                                max="180"
                                value={form.lng}
                                onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                                placeholder="74.2433"
                                required
                            />
                        </Field>
                    </div>
                    {error && <p className="text-sm text-status-danger">{error}</p>}
                </form>
            </Modal>
        </div>
    );
}
