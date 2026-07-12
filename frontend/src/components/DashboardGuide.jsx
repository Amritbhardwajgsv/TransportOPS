import { ArrowRight, CircleHelp, Lightbulb } from 'lucide-react';

export default function DashboardGuide({ title = 'How to use this dashboard', description, steps, tip }) {
    return (
        <section className="rounded-xl border border-coal-600 bg-coal-900 p-4 sm:p-5" aria-labelledby="dashboard-guide-title">
            <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-volt-400 text-volt-950">
                    <CircleHelp size={19} />
                </span>
                <div>
                    <h2 id="dashboard-guide-title" className="font-display text-lg font-semibold text-smoke-100">{title}</h2>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-smoke-400">{description}</p>
                </div>
            </div>

            <ol className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {steps.map((step, index) => (
                    <li key={step.label} className="relative rounded-lg border border-coal-600 bg-coal-950 p-4">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-volt-400">0{index + 1}</span>
                            <ArrowRight size={14} className="text-smoke-400" />
                            <h3 className="font-medium text-smoke-100">{step.label}</h3>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-smoke-400">{step.detail}</p>
                    </li>
                ))}
            </ol>

            {tip && (
                <div className="mt-4 flex items-start gap-2 border-t border-coal-600 pt-4 text-xs leading-5 text-smoke-400">
                    <Lightbulb size={15} className="mt-0.5 shrink-0 text-volt-400" />
                    <p><span className="font-medium text-smoke-100">Good to know:</span> {tip}</p>
                </div>
            )}
        </section>
    );
}
