import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'transitops-theme';

function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState(getInitialTheme);
    const light = theme === 'light';

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    return (
        <button
            type="button"
            onClick={() => setTheme(light ? 'dark' : 'light')}
            className="theme-toggle focus-volt fixed top-3 right-16 z-[60] flex h-10 items-center gap-2 rounded-full border border-coal-600 bg-coal-900 px-3 text-sm text-smoke-100 shadow-lg transition hover:bg-coal-800 sm:top-4 sm:right-5"
            aria-label={`Switch to ${light ? 'dark' : 'light'} mode`}
            title={`Switch to ${light ? 'dark' : 'light'} mode`}
        >
            {light ? <Moon size={17} /> : <Sun size={17} />}
            <span className="hidden md:inline">{light ? 'Dark' : 'Light'}</span>
        </button>
    );
}
