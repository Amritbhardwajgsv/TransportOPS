import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, TriangleAlert } from 'lucide-react';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import api from '../../lib/api';
import RoleHeroHeader from '../../components/RoleHeroHeader';
import KpiCard from '../../components/KpiCard';
import RuleCallout from '../../components/RuleCallout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import DashboardGuide from '../../components/DashboardGuide';

export default function ComplianceWatch() {
    const navigate = useNavigate();
    const { data, loading } = useDashboardSummary();
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        api.get('/drivers').then((res) => setDrivers(res.data.drivers));
    }, []);

    if (loading || !data) {
        return <div className="text-smoke-400">Loading…</div>;
    }

    const validLicenses = data.drivers.total - data.drivers.expired;

    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'license_number', header: 'License', render: (d) => <span className="font-mono">{d.license_number}</span> },
        {
            key: 'license_expiry',
            header: 'Expires',
            render: (d) => (
                <span
                    className={`font-mono ${
                        d.is_expired ? 'text-status-danger' : d.days_until_expiry <= 30 ? 'text-status-draft' : 'text-smoke-100'
                    }`}
                >
                    {d.is_expired && <TriangleAlert size={13} className="mr-1 inline" />}
                    {new Date(d.license_expiry).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'safety_score',
            header: 'Safety score',
            align: 'right',
            render: (d) => <span className={d.safety_score < 50 ? 'text-status-danger' : ''}>{d.safety_score}</span>,
        },
        { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
    ];

    return (
        <div className="space-y-6">
            <RoleHeroHeader icon={ShieldCheck} title="Compliance Watch" description="Licenses, suspensions, and safety scores." />

            <DashboardGuide
                description="Use this view to prevent compliance risks before dispatch by prioritizing expired documents, upcoming renewals, and unsafe driver records."
                steps={[
                    { label: 'Scan the totals', detail: 'Expired, expiring-soon, and suspended counts show the most urgent compliance workload.' },
                    { label: 'Review the radar', detail: 'Inspect license dates and safety scores. Warning colors identify records that need earlier action.' },
                    { label: 'Update eligibility', detail: 'Open a driver record to correct details, suspend an unsafe driver, or reinstate an eligible one.' },
                ]}
                tip="Expired or suspended drivers are automatically excluded from trip assignment, so compliance decisions immediately affect dispatch."
            />

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                <KpiCard label="Valid licenses" value={validLicenses} />
                <KpiCard label="Expiring ≤30 days" value={data.drivers.expiringSoon} />
                <KpiCard label="Expired" value={data.drivers.expired} />
                <KpiCard label="Suspended" value={data.drivers.suspended} />
            </div>

            <RuleCallout>Drivers with expired licenses or Suspended status never appear in dispatch.</RuleCallout>

            <div>
                <h2 className="font-display text-lg font-semibold text-smoke-100">License radar</h2>
                <p className="mb-3 mt-1 text-sm text-smoke-400">Select any driver to open the full record and take a compliance action.</p>
                <DataTable
                    columns={columns}
                    rows={drivers}
                    onRowClick={() => navigate('/drivers')}
                    empty={<EmptyState icon={ShieldCheck} title="No drivers yet" />}
                />
            </div>
        </div>
    );
}
