import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Field, { Input } from '../components/Field';
import StatusBadge from '../components/StatusBadge';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [shake, setShake] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            navigate(location.state?.from ?? '/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message ?? 'Something went wrong');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen">
            <div className="hazard-stripe relative hidden w-[45%] flex-col justify-between overflow-hidden bg-coal-950 p-10 lg:flex">
                <div className="animate-fade-in-up flex items-center gap-2">
                    <span className="h-2 w-2 bg-volt-400" />
                    <span className="font-display text-lg font-semibold tracking-wide text-smoke-100">TRANSITOPS</span>
                </div>

                <div className="animate-fade-in-up flex flex-col items-start gap-6" style={{ animationDelay: '100ms' }}>
                    <Truck size={120} strokeWidth={1} className="text-volt-400" />
                    <div>
                        <h1 className="font-display text-3xl font-semibold text-smoke-100">
                            Fleet operations, off the spreadsheet.
                        </h1>
                        <p className="mt-2 max-w-sm text-sm text-smoke-400">
                            Vehicles, drivers, trips, maintenance, and cost — one dashboard per role, every rule enforced automatically.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <StatusBadge status="available" />
                        <StatusBadge status="on_trip" />
                        <StatusBadge status="in_shop" />
                    </div>
                </div>

                <p className="animate-fade-in-up text-xs text-smoke-400" style={{ animationDelay: '200ms' }}>
                    &copy; TransitOps
                </p>
            </div>

            <div className="flex flex-1 items-center justify-center bg-coal-950 p-6">
                <form
                    onSubmit={handleSubmit}
                    className={`animate-fade-in-up w-full max-w-sm rounded-lg border border-coal-600 bg-coal-900 p-8 ${
                        shake ? 'animate-shake' : ''
                    }`}
                    style={{ animationDelay: shake ? '0ms' : '150ms' }}
                >
                    <h2 className="font-display text-2xl font-semibold text-smoke-100">Sign in</h2>
                    <p className="mt-1 text-sm text-smoke-400">Log in with the account your fleet manager set up for you.</p>

                    <div className="mt-6 space-y-4">
                        <Field label="Email">
                            <Input
                                type="email"
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@transitops.com"
                            />
                        </Field>
                        <Field label="Password">
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </Field>
                    </div>

                    {error && <p className="mt-4 text-sm text-status-danger">{error}</p>}

                    <Button type="submit" className="mt-6 w-full" disabled={submitting}>
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
