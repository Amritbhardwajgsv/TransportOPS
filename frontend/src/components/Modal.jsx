import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={onClose}>
            <div
                className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-coal-600 bg-coal-900 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-h-[85vh] sm:rounded-lg sm:p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} aria-label="Close" className="focus-volt rounded-lg p-2 text-smoke-400 hover:text-smoke-100">
                        <X size={18} />
                    </button>
                </div>
                <div>{children}</div>
                {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
            </div>
        </div>
    );
}
