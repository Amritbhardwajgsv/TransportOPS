import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-coal-600 bg-coal-900 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="focus-volt rounded text-smoke-400 hover:text-smoke-100">
                        <X size={18} />
                    </button>
                </div>
                <div>{children}</div>
                {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    );
}
