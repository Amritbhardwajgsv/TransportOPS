import { useState } from 'react';
import { Info } from 'lucide-react';

export default function InfoHint({ text }) {
    const [show, setShow] = useState(false);
    return (
        <span
            className="relative inline-flex"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShow((s) => !s);
            }}
        >
            <Info size={13} className="cursor-help text-smoke-400" />
            {show && (
                <span className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-coal-600 bg-coal-800 p-2 text-xs font-normal normal-case tracking-normal text-smoke-100">
                    {text}
                </span>
            )}
        </span>
    );
}
