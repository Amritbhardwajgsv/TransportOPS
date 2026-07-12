import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = ++idCounter;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="flex items-center gap-2 rounded-lg border border-coal-600 bg-coal-900 px-4 py-3 text-sm"
                    >
                        {t.type === 'success' && <CheckCircle2 size={16} className="shrink-0 text-status-available" />}
                        {t.type === 'error' && <XCircle size={16} className="shrink-0 text-status-danger" />}
                        {t.type === 'info' && <Info size={16} className="shrink-0 text-volt-400" />}
                        <span className="text-smoke-100">{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
