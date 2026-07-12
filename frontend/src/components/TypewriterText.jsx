import { useEffect, useState } from 'react';

export default function TypewriterText({ text, speed = 45, className = '' }) {
    const [display, setDisplay] = useState('');

    useEffect(() => {
        setDisplay('');
        let i = 0;
        const interval = setInterval(() => {
            i += 1;
            setDisplay(text.slice(0, i));
            if (i >= text.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <span className={className}>
            {display}
            <span className="text-volt-400 animate-pulse">|</span>
        </span>
    );
}
