import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { findPublicRole, PUBLIC_ROLES } from '../lib/roleConfig';

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '' };

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeRole = useMemo(() => findPublicRole(searchParams.get('role')), [searchParams]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const Icon = activeRole.icon;

    function selectRole(role) {
        setSearchParams({ role: role.slug });
        setSuccess(false);
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function update(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: '', form: '' }));
    }

    function validate() {
        const next = {};
        if (form.name.trim().length < 2) next.name = 'Enter your full name.';
        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
        if (form.password.length < 8) next.password = 'Use at least 8 characters.';
        if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: activeRole.value });
            setSuccess(true);
        } catch (error) {
            setErrors({ form: error.response?.data?.message ?? 'Registration failed. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="page-boundary hazard-stripe min-h-dvh bg-coal-950 py-8 sm:py-12">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between gap-4">
                    <Link to="/" className="focus-volt flex items-center gap-2 rounded-md text-sm text-smoke-400 transition hover:text-smoke-100"><ArrowLeft size={16} /> Back to home</Link>
                    <Link to="/login" className="text-sm text-volt-400 hover:underline">Already registered? Sign in</Link>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
                    <aside className="animate-fade-in-up">
                        <p className="text-xs uppercase tracking-[0.2em] text-volt-400">Step 1 · Select your context</p>
                        <h1 className="mt-3 font-display text-3xl font-semibold text-smoke-100 sm:text-5xl">Create the right workspace.</h1>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-smoke-400">Your role controls the dashboard, permitted actions, and operational data you can access. You can change this selection before submitting.</p>

                        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            {PUBLIC_ROLES.map((role) => {
                                const RoleIcon = role.icon;
                                const selected = role.value === activeRole.value;
                                return <button key={role.value} type="button" onClick={() => selectRole(role)} className={`focus-volt flex items-center gap-3 rounded-xl border p-4 text-left transition duration-200 ${selected ? 'border-volt-400 bg-coal-800 shadow-[0_0_0_1px_var(--color-volt-400)]' : 'border-coal-600 bg-coal-900 hover:-translate-y-0.5 hover:border-smoke-400'}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-volt-400 text-volt-950' : 'bg-coal-800 text-smoke-400'}`}><RoleIcon size={20} /></span><span className="min-w-0 flex-1"><span className="block font-medium text-smoke-100">{role.title}</span><span className="mt-0.5 block text-xs text-smoke-400">{role.eyebrow}</span></span>{selected && <Check size={18} className="shrink-0 text-volt-400" />}</button>;
                            })}
                        </div>
                    </aside>

                    <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="overflow-hidden rounded-2xl border border-coal-600 bg-coal-900 shadow-2xl">
                            <div className="border-b border-coal-600 bg-coal-800 p-5 sm:p-7">
                                <div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-volt-400 text-volt-950"><Icon size={24} /></span><div><p className="text-xs uppercase tracking-wider text-smoke-400">Registering as</p><h2 className="font-display text-2xl font-semibold text-smoke-100">{activeRole.title}</h2></div></div>
                                <p className="mt-4 text-sm leading-6 text-smoke-400">{activeRole.description}</p>
                                <div className="mt-4 flex flex-wrap gap-2">{activeRole.capabilities.map((item) => <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-coal-600 bg-coal-900 px-3 py-1 text-xs text-smoke-400"><CheckCircle2 size={13} className="text-volt-400" />{item}</span>)}</div>
                            </div>

                            {success ? (
                                <div className="p-6 text-center sm:p-10">
                                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-volt-400 text-volt-950"><Check size={30} /></span>
                                    <h2 className="mt-5 font-display text-3xl font-semibold text-smoke-100">Your account is ready.</h2>
                                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-smoke-400">Your {activeRole.title} workspace has been created. Sign in with <strong className="text-smoke-100">{form.email}</strong> to continue.</p>
                                    <Button onClick={() => navigate('/login')} className="mt-6">Continue to sign in <ArrowRight size={16} /></Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-5 sm:p-7" noValidate>
                                    <div><p className="text-xs uppercase tracking-[0.2em] text-volt-400">Step 2 · Account details</p><h2 className="mt-2 font-display text-2xl font-semibold text-smoke-100">Tell us who you are.</h2><p className="mt-1 text-sm text-smoke-400">All fields are required. Your email becomes your sign-in ID.</p></div>
                                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                        <FormField label="Full name" error={errors.name}><input autoFocus autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Alex Morgan" className="register-input" /></FormField>
                                        <FormField label="Work email" error={errors.email}><input type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@company.com" className="register-input" /></FormField>
                                        <FormField label="Password" error={errors.password}><div className="relative"><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Minimum 8 characters" className="register-input pr-11" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-smoke-400 hover:text-smoke-100">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></FormField>
                                        <FormField label="Confirm password" error={errors.confirmPassword}><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Repeat your password" className="register-input" /></FormField>
                                    </div>
                                    {errors.form && <div role="alert" className="mt-5 rounded-lg border border-status-danger/40 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">{errors.form}</div>}
                                    <div className="mt-6 flex items-start gap-2 rounded-lg border border-coal-600 bg-coal-950 p-3 text-xs leading-5 text-smoke-400"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-volt-400" />Your password is securely hashed. Role permissions are also enforced by the server on every protected action.</div>
                                    <Button type="submit" disabled={submitting} className="mt-6 w-full">{submitting ? 'Creating your workspace…' : `Create ${activeRole.title} account`} {!submitting && <ArrowRight size={16} />}</Button>
                                </form>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

function FormField({ label, error, children }) {
    return <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-wider text-smoke-400">{label}</span>{children}{error && <span className="mt-1.5 block text-xs text-status-danger">{error}</span>}</label>;
}
