import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, Database, Gauge, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import TypewriterText from '../components/TypewriterText';
import Button from '../components/Button';
import { PUBLIC_ROLES } from '../lib/roleConfig';

const FLOW = [
    { icon: Database, number: '01', title: 'Capture operations', text: 'Register vehicles, drivers, trips, fuel, expenses, and maintenance in one dependable workspace.' },
    { icon: Workflow, number: '02', title: 'Automate the rules', text: 'Statuses and eligibility update together, preventing double assignment and unsafe dispatch.' },
    { icon: BarChart3, number: '03', title: 'Act on the signal', text: 'Each role sees the metrics, warnings, records, and actions that matter to their work.' },
];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <main id="top" className="overflow-hidden bg-coal-950">
            <section className="page-boundary hazard-stripe relative flex min-h-[90dvh] items-center border-b border-coal-600 py-24">
                <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="animate-fade-in-up">
                        <a href="#top" className="focus-volt inline-flex items-center gap-2 rounded-md" aria-label="TransitOps home">
                            <span className="h-2.5 w-2.5 bg-volt-400" />
                            <span className="font-display text-xl font-semibold tracking-wide text-smoke-100">TRANSITOPS</span>
                        </a>
                        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-coal-600 bg-coal-900 px-3 py-1.5 text-xs text-smoke-400">
                            <Sparkles size={14} className="text-volt-400" /> One source of truth for every fleet role
                        </div>
                        <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.05] text-smoke-100 sm:text-6xl lg:text-7xl">
                            <TypewriterText text="Fleet operations, off the spreadsheet." />
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-smoke-400 sm:text-lg">
                            Plan work, protect compliance, control cost, and understand fleet performance through focused role-based workspaces.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button onClick={() => document.querySelector('#roles')?.scrollIntoView({ behavior: 'smooth' })}>Choose your role <ArrowRight size={16} /></Button>
                            <Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button>
                        </div>
                    </div>

                    <div className="animate-fade-in-up grid grid-cols-2 gap-3" style={{ animationDelay: '140ms' }}>
                        {[
                            ['4', 'Focused role dashboards'], ['1', 'Shared operational truth'], ['Live', 'Eligibility safeguards'], ['End-to-end', 'Fleet cost visibility'],
                        ].map(([value, label], index) => (
                            <div key={label} className={`rounded-xl border border-coal-600 bg-coal-900/90 p-5 shadow-xl ${index === 0 || index === 3 ? 'translate-y-4' : ''}`}>
                                <p className="font-mono text-2xl font-semibold text-volt-400 sm:text-3xl">{value}</p>
                                <p className="mt-2 text-xs leading-5 text-smoke-400 sm:text-sm">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="page-boundary py-20 sm:py-28">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.22em] text-volt-400">How TransitOps works</p>
                        <h2 className="mt-3 font-display text-3xl font-semibold text-smoke-100 sm:text-5xl">From daily records to confident decisions.</h2>
                        <p className="mt-4 leading-7 text-smoke-400">The same operational event flows through every relevant dashboard, so teams stop reconciling disconnected files.</p>
                    </div>
                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {FLOW.map(({ icon: Icon, number, title, text }) => (
                            <article key={title} className="group rounded-xl border border-coal-600 bg-coal-900 p-6 transition duration-300 hover:-translate-y-1 hover:border-volt-400">
                                <div className="flex items-center justify-between"><Icon className="text-volt-400" /><span className="font-mono text-xs text-smoke-400">{number}</span></div>
                                <h3 className="mt-8 font-display text-xl font-semibold text-smoke-100">{title}</h3>
                                <p className="mt-3 text-sm leading-6 text-smoke-400">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="roles" className="page-boundary hazard-stripe border-y border-coal-600 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div className="max-w-2xl"><p className="text-xs uppercase tracking-[0.22em] text-volt-400">Role-based by design</p><h2 className="mt-3 font-display text-3xl font-semibold text-smoke-100 sm:text-5xl">Choose the workspace built for you.</h2></div>
                        <p className="max-w-md text-sm leading-6 text-smoke-400">You can review and change the selected role again on the registration page before creating your account.</p>
                    </div>
                    <div className="mt-10 grid gap-5 md:grid-cols-2">
                        {PUBLIC_ROLES.map(({ icon: Icon, title, slug, eyebrow, description, capabilities, outcome }) => (
                            <article key={slug} className="flex flex-col rounded-2xl border border-coal-600 bg-coal-900 p-6 transition duration-300 hover:-translate-y-1 hover:border-volt-400 sm:p-7">
                                <div className="flex items-start justify-between gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-volt-400 text-volt-950"><Icon size={24} /></span><span className="rounded-full border border-coal-600 px-3 py-1 text-xs text-smoke-400">{eyebrow}</span></div>
                                <h3 className="mt-6 font-display text-2xl font-semibold text-smoke-100">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-smoke-400">{description}</p>
                                <ul className="mt-5 grid gap-2 sm:grid-cols-2">{capabilities.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-smoke-400"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-volt-400" />{item}</li>)}</ul>
                                <div className="mt-6 border-t border-coal-600 pt-5"><p className="text-xs leading-5 text-smoke-400"><strong className="text-smoke-100">Your outcome:</strong> {outcome}</p><Button onClick={() => navigate(`/register?role=${slug}`)} className="mt-5 w-full sm:w-auto">Register as {title} <ArrowRight size={15} /></Button></div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="page-boundary py-20 sm:py-28">
                <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
                    {[{ icon: ShieldCheck, title: 'Rules enforced at the source', text: 'Unavailable resources stay out of dispatch, keeping preventable conflicts from entering the workflow.' }, { icon: Gauge, title: 'Attention before reports', text: 'Expired licenses, stale drafts, workshop vehicles, and cost changes surface where action happens.' }, { icon: BarChart3, title: 'One record, many perspectives', text: 'Operations, safety, and finance read from shared fleet activity without duplicating entry.' }].map(({ icon: Icon, title, text }) => <article key={title} className="rounded-xl border-l-2 border-volt-400 bg-coal-900 p-6"><Icon size={22} className="text-volt-400" /><h3 className="mt-4 font-display text-xl font-semibold text-smoke-100">{title}</h3><p className="mt-2 text-sm leading-6 text-smoke-400">{text}</p></article>)}
                </div>
            </section>

            <section className="page-boundary pb-20"><div className="hazard-stripe mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl border border-coal-600 p-7 sm:p-10 md:flex-row md:items-center"><div><h2 className="font-display text-3xl font-semibold text-smoke-100">Ready to run a clearer fleet?</h2><p className="mt-2 text-sm text-smoke-400">Choose a role to create an account, or continue with an existing workspace.</p></div><div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><Button onClick={() => document.querySelector('#roles')?.scrollIntoView({ behavior: 'smooth' })}>Create account</Button><Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button></div></div></section>

            <footer className="page-boundary border-t border-coal-600 py-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-smoke-400 sm:flex-row sm:items-center sm:justify-between"><Link to="/" className="font-display text-base font-semibold text-smoke-100">■ TRANSITOPS</Link><p>Role-aware fleet operations, from dispatch to decision.</p></div></footer>
        </main>
    );
}
