import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, Clock3, Database, Eye, Gauge, Link2, MapPin, Navigation, ShieldCheck, Sparkles, Truck, UsersRound, Workflow, Zap } from 'lucide-react';
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
            <section className="landing-hero page-boundary relative flex min-h-[90dvh] items-center border-b border-coal-600 py-24">
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

                    <div className="journey-float animate-fade-in-up relative" style={{ animationDelay: '140ms' }}>
                        <div className="absolute -inset-10 rounded-full bg-volt-400/10 blur-3xl" />
                        <div className="relative overflow-hidden rounded-2xl border border-coal-600 bg-coal-900/95 p-5 shadow-2xl sm:p-7">
                            <div className="flex items-center justify-between gap-4">
                                <div><p className="text-xs uppercase tracking-[0.18em] text-smoke-400">Live journey</p><p className="mt-1 font-mono text-sm font-semibold text-smoke-100">TRIP-2048</p></div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-volt-400 px-3 py-1 text-xs font-medium text-volt-950"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-volt-950" />On trip</span>
                            </div>

                            <div className="mt-8 flex items-start justify-between gap-3">
                                <div><span className="flex h-10 w-10 items-center justify-center rounded-full border border-coal-600 bg-coal-800 text-volt-400"><MapPin size={18} /></span><p className="mt-3 font-display text-xl font-semibold text-smoke-100">Mumbai</p><p className="text-xs text-smoke-400">Origin</p></div>
                                <div className="mt-5 min-w-0 flex-1 px-2">
                                    <div className="relative h-1 rounded-full bg-coal-600">
                                        <div className="journey-progress absolute inset-y-0 left-0 rounded-full bg-volt-400" />
                                        <span className="journey-truck absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-volt-400 bg-coal-950 text-volt-400 shadow-[0_0_18px_rgba(198,244,50,0.35)]"><Truck size={17} /></span>
                                    </div>
                                    <p className="mt-5 text-center font-mono text-xs text-smoke-400">148 km total</p>
                                </div>
                                <div className="text-right"><span className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-coal-600 bg-coal-800 text-volt-400"><Navigation size={18} /></span><p className="mt-3 font-display text-xl font-semibold text-smoke-100">Pune</p><p className="text-xs text-smoke-400">Destination</p></div>
                            </div>

                            <div className="mt-8 grid grid-cols-3 divide-x divide-coal-600 rounded-xl border border-coal-600 bg-coal-950 p-4">
                                <div><p className="text-xs text-smoke-400">Covered</p><p className="mt-1 font-mono text-sm font-semibold text-smoke-100">92 km</p></div>
                                <div className="px-4"><p className="text-xs text-smoke-400">Remaining</p><p className="mt-1 font-mono text-sm font-semibold text-smoke-100">56 km</p></div>
                                <div className="pl-4"><p className="flex items-center gap-1 text-xs text-smoke-400"><Clock3 size={12} /> ETA</p><p className="mt-1 font-mono text-sm font-semibold text-volt-400">01:12</p></div>
                            </div>

                            <div className="mt-4 flex items-center gap-3 rounded-xl border border-coal-600 bg-coal-800 p-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-volt-400/15 text-volt-400"><Gauge size={18} /></span><div className="min-w-0 flex-1"><div className="flex justify-between text-xs"><span className="text-smoke-400">Journey progress</span><span className="font-mono text-smoke-100">62%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-coal-600"><div className="journey-progress h-full rounded-full bg-volt-400" /></div></div></div>
                        </div>
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

            <section className="page-boundary pb-20 sm:pb-28">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-coal-600 bg-coal-900">
                    <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                        <div className="relative flex flex-col justify-between overflow-hidden border-b border-coal-600 p-7 sm:p-10 lg:border-r lg:border-b-0">
                            <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-volt-400/10 blur-3xl" />
                            <div className="relative">
                                <p className="text-xs uppercase tracking-[0.22em] text-volt-400">Why we are different</p>
                                <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-smoke-100 sm:text-5xl">
                                    Most software records what happened.
                                    <span className="mt-2 block text-volt-400">TransitOps shapes what happens next.</span>
                                </h2>
                                <p className="mt-6 max-w-xl text-sm leading-7 text-smoke-400">
                                    We do not give every person the same crowded screen and call it visibility. Each role gets the context to decide, while the platform keeps every decision connected.
                                </p>
                            </div>
                            <div className="relative mt-10 flex items-center gap-3 text-sm text-smoke-100"><span className="h-px w-10 bg-volt-400" /> Less chasing. Fewer assumptions. Better movement.</div>
                        </div>

                        <div className="grid sm:grid-cols-2">
                            {[
                                { icon: Eye, kicker: 'Clarity over clutter', title: 'See the decision, not just the data.', text: 'Dashboards surface the few signals that need attention instead of burying teams under endless fields and charts.' },
                                { icon: Link2, kicker: 'Connected by default', title: 'One action updates the whole operation.', text: 'Dispatch, availability, compliance, and cost stay connected—without teams reconciling separate spreadsheets later.' },
                                { icon: Zap, kicker: 'Action over observation', title: 'Warnings lead somewhere useful.', text: 'An expired license, stale trip, or expensive vehicle appears beside the workflow that can resolve it.' },
                                { icon: UsersRound, kicker: 'Built around people', title: 'Every role gets its own command center.', text: 'Managers, drivers, safety teams, and analysts work from focused views while sharing the same operational truth.' },
                            ].map(({ icon: Icon, kicker, title, text }, index) => (
                                <article key={title} className={`group p-6 transition duration-300 hover:bg-coal-800 sm:p-8 ${index < 2 ? 'border-b border-coal-600' : ''} ${index % 2 === 0 ? 'sm:border-r sm:border-coal-600' : ''}`}>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-coal-600 bg-coal-950 text-volt-400 transition duration-300 group-hover:-translate-y-1 group-hover:border-volt-400"><Icon size={19} /></span>
                                    <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-volt-400">{kicker}</p>
                                    <h3 className="mt-2 font-display text-xl font-semibold text-smoke-100">{title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-smoke-400">{text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="roles" className="page-boundary border-y border-coal-600 bg-coal-900/35 py-20 sm:py-28">
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

            <section className="page-boundary pb-20"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl border border-coal-600 bg-coal-900 p-7 sm:p-10 md:flex-row md:items-center"><div><h2 className="font-display text-3xl font-semibold text-smoke-100">Ready to run a clearer fleet?</h2><p className="mt-2 text-sm text-smoke-400">Choose a role to create an account, or continue with an existing workspace.</p></div><div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><Button onClick={() => document.querySelector('#roles')?.scrollIntoView({ behavior: 'smooth' })}>Create account</Button><Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button></div></div></section>

            <footer className="page-boundary border-t border-coal-600 py-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-smoke-400 sm:flex-row sm:items-center sm:justify-between"><Link to="/" className="font-display text-base font-semibold text-smoke-100">■ TRANSITOPS</Link><p>Role-aware fleet operations, from dispatch to decision.</p></div></footer>
        </main>
    );
}
