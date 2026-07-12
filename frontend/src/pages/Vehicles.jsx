import { useEffect, useState } from 'react';
import { Plus, Truck, Search, FileText, Download, Trash2, Upload } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Drawer from '../components/Drawer';
import ConfirmDialog from '../components/ConfirmDialog';
import Field, { Input, Select } from '../components/Field';
import StatusBadge from '../components/StatusBadge';
import PhotoThumb from '../components/PhotoThumb';
import EmptyState from '../components/EmptyState';
import { fileToBase64 } from '../lib/fileToBase64';
import { useCities } from '../hooks/useCities';

const VEHICLE_TYPES = ['truck', 'van', 'trailer', 'pickup'];
const STATUS_FILTERS = ['available', 'on_trip', 'in_shop', 'retired'];
const MAX_PHOTO_BYTES = 250000;
const DOCUMENT_TYPES = ['RC', 'Insurance', 'PUC', 'Permit', 'Other'];
const MAX_DOCUMENT_BYTES = 1500000;

const emptyForm = {
    registrationNumber: '',
    model: '',
    type: 'truck',
    maxLoadKg: '',
    odometerKm: '',
    acquisitionCost: '',
    photo: null,
    currentLocationCity: '',
};

function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Vehicles() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { cities } = useCities();
    const canManage = user.role === 'fleet_manager';

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [fieldError, setFieldError] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const [drawerVehicle, setDrawerVehicle] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    const [documents, setDocuments] = useState([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [docForm, setDocForm] = useState({ docType: 'RC', file: null, fileName: '' });
    const [docError, setDocError] = useState('');
    const [docUploading, setDocUploading] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

    async function load() {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/vehicles', { params });
            setVehicles(res.data.vehicles);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, statusFilter]);

    async function loadDocuments(vehicleId) {
        setDocumentsLoading(true);
        try {
            const res = await api.get('/vehicle-documents', { params: { vehicleId } });
            setDocuments(res.data.documents);
        } finally {
            setDocumentsLoading(false);
        }
    }

    useEffect(() => {
        if (drawerVehicle) {
            setDocForm({ docType: 'RC', file: null, fileName: '' });
            setDocError('');
            loadDocuments(drawerVehicle.id);
        } else {
            setDocuments([]);
        }
    }, [drawerVehicle]);

    function openCreate() {
        setEditing(null);
        setForm(emptyForm);
        setFieldError({});
        setModalOpen(true);
    }

    function openEdit(vehicle) {
        setEditing(vehicle);
        setForm({
            registrationNumber: vehicle.registration_number,
            model: vehicle.model,
            type: vehicle.type,
            maxLoadKg: vehicle.max_load_kg,
            odometerKm: vehicle.odometer_km,
            acquisitionCost: vehicle.acquisition_cost ?? '',
            photo: vehicle.photo,
            currentLocationCity: vehicle.current_location_city ?? '',
        });
        setFieldError({});
        setModalOpen(true);
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
        if (!form.maxLoadKg || Number(form.maxLoadKg) <= 0) {
            setFieldError((f) => ({ ...f, maxLoadKg: 'Must be a positive number' }));
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                registrationNumber: form.registrationNumber.trim().toUpperCase(),
                model: form.model,
                type: form.type,
                maxLoadKg: Number(form.maxLoadKg),
                odometerKm: form.odometerKm === '' ? 0 : Number(form.odometerKm),
                acquisitionCost: form.acquisitionCost === '' ? null : Number(form.acquisitionCost),
                photo: form.photo,
                currentLocationCity: form.currentLocationCity || null,
            };
            if (editing) {
                await api.put(`/vehicles/${editing.id}`, payload);
                showToast(`Vehicle ${payload.registrationNumber} updated`, 'success');
            } else {
                await api.post('/vehicles', payload);
                showToast(`Vehicle ${payload.registrationNumber} added to the fleet`, 'success');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            if (err.response?.status === 409) {
                setFieldError({ registrationNumber: err.response.data.message });
            } else {
                showToast(err.response?.data?.message ?? 'Something went wrong', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleConfirmAction() {
        const { vehicle, type } = confirmAction;
        try {
            await api.post(`/vehicles/${vehicle.id}/${type}`);
            showToast(
                type === 'retire' ? `${vehicle.registration_number} retired` : `${vehicle.registration_number} reinstated`,
                'success'
            );
            setConfirmAction(null);
            setDrawerVehicle(null);
            load();
        } catch (err) {
            showToast(err.response?.data?.message ?? 'Something went wrong', 'error');
        }
    }

    async function handleDocFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > MAX_DOCUMENT_BYTES) {
            setDocError('File must be under ~1.5MB');
            return;
        }
        const base64 = await fileToBase64(file);
        setDocForm((f) => ({ ...f, file: base64, fileName: file.name, mimeType: file.type || 'application/octet-stream' }));
        setDocError('');
    }

    async function handleUploadDocument() {
        if (!docForm.file) {
            setDocError('Choose a file to upload');
            return;
        }
        setDocUploading(true);
        setDocError('');
        try {
            await api.post('/vehicle-documents', {
                vehicleId: drawerVehicle.id,
                docType: docForm.docType,
                fileName: docForm.fileName,
                mimeType: docForm.mimeType,
                fileData: docForm.file,
            });
            showToast(`${docForm.docType} uploaded for ${drawerVehicle.registration_number}`, 'success');
            setDocForm({ docType: 'RC', file: null, fileName: '' });
            loadDocuments(drawerVehicle.id);
        } catch (err) {
            setDocError(err.response?.data?.message ?? 'Something went wrong');
        } finally {
            setDocUploading(false);
        }
    }

    async function handleViewDocument(doc) {
        const res = await api.get(`/vehicle-documents/${doc.id}/file`);
        const a = document.createElement('a');
        a.href = res.data.fileData;
        a.download = res.data.fileName;
        a.target = '_blank';
        a.click();
    }

    async function handleDeleteDocument() {
        try {
            await api.delete(`/vehicle-documents/${docToDelete.id}`);
            showToast(`${docToDelete.file_name} deleted`, 'success');
            setDocToDelete(null);
            loadDocuments(drawerVehicle.id);
        } catch (err) {
            showToast(err.response?.data?.message ?? 'Something went wrong', 'error');
        }
    }

    const columns = [
        { key: 'photo', header: '', sortable: false, render: (v) => <PhotoThumb photo={v.photo} /> },
        {
            key: 'registration_number',
            header: 'Reg',
            render: (v) => <span className="font-mono font-semibold">{v.registration_number}</span>,
        },
        { key: 'model', header: 'Model' },
        { key: 'type', header: 'Type', render: (v) => <span className="capitalize">{v.type}</span> },
        {
            key: 'max_load_kg',
            header: 'Max load',
            align: 'right',
            sortValue: (v) => Number(v.max_load_kg),
            render: (v) => `${Number(v.max_load_kg).toLocaleString()} kg`,
        },
        {
            key: 'odometer_km',
            header: 'Odometer',
            align: 'right',
            sortValue: (v) => Number(v.odometer_km),
            render: (v) => `${Number(v.odometer_km).toLocaleString()} km`,
        },
        {
            key: 'acquisition_cost',
            header: 'Cost',
            align: 'right',
            sortValue: (v) => Number(v.acquisition_cost ?? 0),
            render: (v) => (v.acquisition_cost ? `₹${Number(v.acquisition_cost).toLocaleString()}` : '—'),
        },
        {
            key: 'current_location_city',
            header: 'Location',
            render: (v) => v.current_location_city ?? <span className="text-smoke-400">Unknown</span>,
        },
        { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
        ...(canManage
            ? [
                  {
                      key: 'actions',
                      header: '',
                      sortable: false,
                      render: (v) => (
                          <Button
                              variant="ghost"
                              className="h-8 px-3 text-xs"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(v);
                              }}
                          >
                              Edit
                          </Button>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold text-smoke-100">Vehicles</h1>
                    <p className="mt-1 text-sm text-smoke-400">
                        Your fleet&apos;s master list. Status changes automatically as vehicles are dispatched or serviced.
                    </p>
                </div>
                {canManage && (
                    <Button onClick={openCreate}>
                        <Plus size={16} /> Add vehicle
                    </Button>
                )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-400" />
                    <input
                        className="focus-volt h-10 w-full rounded-lg border border-coal-600 bg-coal-800 pl-9 pr-3 text-sm text-smoke-100 placeholder:text-smoke-400"
                        placeholder="Search reg or model…"
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
                    rows={vehicles}
                    loading={loading}
                    onRowClick={setDrawerVehicle}
                    empty={
                        <EmptyState
                            icon={Truck}
                            title="No vehicles yet"
                            description={
                                canManage
                                    ? 'Add your first vehicle to get the fleet on the road.'
                                    : 'No vehicles match your search.'
                            }
                        />
                    }
                />
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit vehicle' : 'Add vehicle'}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Saving…' : 'Save vehicle'}
                        </Button>
                    </>
                }
            >
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Field label="Registration number" error={fieldError.registrationNumber}>
                        <Input
                            value={form.registrationNumber}
                            onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value }))}
                            placeholder="MH12AB1234"
                            required
                        />
                    </Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Model">
                            <Input
                                value={form.model}
                                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                                required
                            />
                        </Field>
                        <Field label="Type">
                            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                                {VEHICLE_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Max load (kg)" error={fieldError.maxLoadKg}>
                            <Input
                                type="number"
                                min="1"
                                value={form.maxLoadKg}
                                onChange={(e) => setForm((f) => ({ ...f, maxLoadKg: e.target.value }))}
                                required
                            />
                        </Field>
                        <Field label="Odometer (km)">
                            <Input
                                type="number"
                                min="0"
                                value={form.odometerKm}
                                onChange={(e) => setForm((f) => ({ ...f, odometerKm: e.target.value }))}
                            />
                        </Field>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Acquisition cost (₹)">
                            <Input
                                type="number"
                                min="0"
                                value={form.acquisitionCost}
                                onChange={(e) => setForm((f) => ({ ...f, acquisitionCost: e.target.value }))}
                            />
                        </Field>
                        <Field label="Current location">
                            <Select
                                value={form.currentLocationCity}
                                onChange={(e) => setForm((f) => ({ ...f, currentLocationCity: e.target.value }))}
                            >
                                <option value="">Unknown</option>
                                {cities.map((c) => (
                                    <option key={c.name} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                    </div>
                    <Field label="Photo (optional)" error={fieldError.photo}>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm text-smoke-400" />
                        {form.photo && <img src={form.photo} alt="" className="mt-2 h-24 w-full rounded object-cover" />}
                    </Field>
                </form>
            </Modal>

            <Drawer open={!!drawerVehicle} onClose={() => setDrawerVehicle(null)} title={drawerVehicle?.registration_number ?? ''}>
                {drawerVehicle && (
                    <div className="space-y-4">
                        {drawerVehicle.photo ? (
                            <img src={drawerVehicle.photo} alt="" className="aspect-video w-full rounded-lg object-cover" />
                        ) : (
                            <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-coal-800 text-smoke-400">
                                <Truck size={48} strokeWidth={1.5} />
                            </div>
                        )}
                        <StatusBadge status={drawerVehicle.status} />
                        <dl className="grid grid-cols-2 gap-y-3 text-sm">
                            <dt className="text-smoke-400">Model</dt>
                            <dd className="text-right">{drawerVehicle.model}</dd>
                            <dt className="text-smoke-400">Type</dt>
                            <dd className="text-right capitalize">{drawerVehicle.type}</dd>
                            <dt className="text-smoke-400">Max load</dt>
                            <dd className="text-right font-mono">{Number(drawerVehicle.max_load_kg).toLocaleString()} kg</dd>
                            <dt className="text-smoke-400">Odometer</dt>
                            <dd className="text-right font-mono">{Number(drawerVehicle.odometer_km).toLocaleString()} km</dd>
                            <dt className="text-smoke-400">Location</dt>
                            <dd className="text-right">{drawerVehicle.current_location_city ?? 'Unknown'}</dd>
                            <dt className="text-smoke-400">Acquisition cost</dt>
                            <dd className="text-right font-mono">
                                {drawerVehicle.acquisition_cost
                                    ? `₹${Number(drawerVehicle.acquisition_cost).toLocaleString()}`
                                    : '—'}
                            </dd>
                        </dl>
                        {canManage && (
                            <div className="flex gap-2">
                                <Button variant="ghost" className="flex-1" onClick={() => openEdit(drawerVehicle)}>
                                    Edit
                                </Button>
                                {drawerVehicle.status !== 'retired' && (
                                    <Button
                                        variant="danger"
                                        className="flex-1"
                                        onClick={() => setConfirmAction({ vehicle: drawerVehicle, type: 'retire' })}
                                    >
                                        Retire
                                    </Button>
                                )}
                                {drawerVehicle.status === 'retired' && (
                                    <Button
                                        className="flex-1"
                                        onClick={() => setConfirmAction({ vehicle: drawerVehicle, type: 'reinstate' })}
                                    >
                                        Reinstate
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="border-t border-coal-600 pt-4">
                            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-smoke-100">
                                <FileText size={16} /> Documents
                            </h3>
                            <p className="mb-3 text-xs text-smoke-400">RC, insurance, PUC, and permit scans for this vehicle.</p>

                            {documentsLoading ? (
                                <div className="space-y-2">
                                    {[0, 1].map((i) => (
                                        <div key={i} className="h-12 animate-pulse rounded-lg bg-coal-800" />
                                    ))}
                                </div>
                            ) : documents.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-coal-600 py-4 text-center text-xs text-smoke-400">
                                    No documents uploaded yet
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between gap-2 rounded-lg border border-coal-600 bg-coal-900 px-3 py-2"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm text-smoke-100">
                                                    <span className="text-volt-400">{doc.doc_type}</span> · {doc.file_name}
                                                </p>
                                                <p className="text-xs text-smoke-400">
                                                    {formatFileSize(doc.file_size)} · {new Date(doc.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleViewDocument(doc)}
                                                className="focus-volt shrink-0 rounded p-1.5 text-smoke-400 hover:bg-coal-800 hover:text-volt-400"
                                                title="Download"
                                            >
                                                <Download size={15} />
                                            </button>
                                            {canManage && (
                                                <button
                                                    onClick={() => setDocToDelete(doc)}
                                                    className="focus-volt shrink-0 rounded p-1.5 text-smoke-400 hover:bg-coal-800 hover:text-status-danger"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {canManage && (
                                <div className="mt-3 space-y-2 rounded-lg border border-coal-600 bg-coal-900 p-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Select
                                            value={docForm.docType}
                                            onChange={(e) => setDocForm((f) => ({ ...f, docType: e.target.value }))}
                                        >
                                            {DOCUMENT_TYPES.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </Select>
                                        <input
                                            type="file"
                                            accept="application/pdf,image/*"
                                            onChange={handleDocFileChange}
                                            className="text-xs text-smoke-400"
                                        />
                                    </div>
                                    {docError && <p className="text-xs text-status-danger">{docError}</p>}
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-full text-xs"
                                        onClick={handleUploadDocument}
                                        disabled={docUploading || !docForm.file}
                                    >
                                        <Upload size={13} /> {docUploading ? 'Uploading…' : 'Upload document'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Drawer>

            <ConfirmDialog
                open={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirmAction}
                title={confirmAction?.type === 'retire' ? 'Retire vehicle' : 'Reinstate vehicle'}
                description={
                    confirmAction?.type === 'retire'
                        ? `${confirmAction?.vehicle.registration_number} will be retired — it can no longer be dispatched or sent for maintenance.`
                        : `${confirmAction?.vehicle.registration_number} will become Available again.`
                }
                confirmLabel={confirmAction?.type === 'retire' ? 'Retire' : 'Reinstate'}
                variant={confirmAction?.type === 'retire' ? 'danger' : 'primary'}
            />

            <ConfirmDialog
                open={!!docToDelete}
                onClose={() => setDocToDelete(null)}
                onConfirm={handleDeleteDocument}
                title="Delete document"
                description={`${docToDelete?.file_name ?? ''} will be permanently removed.`}
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}
