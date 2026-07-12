import { X } from 'lucide-react';

export default function Drawer({ open, onClose, title, children }) {
    return (
        <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
            <div
                className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            <div
                className={`absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-coal-600 bg-coal-900 transition-transform ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-coal-600 bg-coal-900 px-4 py-4 sm:px-6">
                    <h2 className="font-display text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} aria-label="Close" className="focus-volt rounded-lg p-2 text-smoke-400 hover:text-smoke-100">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">{children}</div>
            </div>
        </div>
    );
}
