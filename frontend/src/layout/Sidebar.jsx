import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NAV_ITEMS } from './navConfig';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import RoleBadge from '../components/RoleBadge';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

    const links = items.map(({ to, label, icon: Icon }) => (
        <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
                `flex min-w-0 items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm transition lg:min-h-0 ${
                    isActive
                        ? 'border-volt-400 bg-coal-800 text-volt-400'
                        : 'border-transparent text-smoke-400 hover:bg-coal-800 hover:text-smoke-100'
                }`
            }
        >
            <Icon size={18} strokeWidth={2} className="shrink-0" />
            <span>{label}</span>
        </NavLink>
    ));

    return (
        <>
        <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-coal-600 bg-coal-900/95 px-4 backdrop-blur lg:hidden">
            <NavLink to="/" aria-label="Return to dashboard" className="focus-volt flex items-center gap-2 rounded-md">
                <span className="h-2 w-2 bg-volt-400" />
                <span className="font-display text-lg font-semibold tracking-wide">TRANSITOPS</span>
            </NavLink>
            <div className="flex items-center gap-3">
                <Avatar name={user.name} size={32} />
                <button onClick={logout} aria-label="Log out" className="focus-volt rounded-lg p-2 text-smoke-400 hover:bg-coal-800 hover:text-smoke-100">
                    <LogOut size={18} />
                </button>
            </div>
        </header>

        <aside className="hidden h-full w-58 shrink-0 flex-col border-r border-coal-600 bg-coal-900 lg:flex">
            <NavLink to="/" aria-label="Return to dashboard" className="focus-volt mx-3 flex items-center gap-2 rounded-md px-2 py-5 transition hover:text-volt-400">
                <span className="h-2 w-2 bg-volt-400" />
                <span className="font-display text-lg font-semibold tracking-wide">TRANSITOPS</span>
            </NavLink>

            <nav className="flex-1 space-y-1 px-3">{links}</nav>

            <div className="border-t border-coal-600 p-4">
                <div className="mb-3 flex items-center gap-2">
                    <Avatar name={user.name} />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-smoke-100">{user.name}</p>
                        <RoleBadge role={user.role} />
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="focus-volt flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-smoke-400 hover:bg-coal-800 hover:text-smoke-100"
                >
                    <LogOut size={16} />
                    Log out
                </button>
            </div>
        </aside>

        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-18 items-stretch gap-1 overflow-x-auto border-t border-coal-600 bg-coal-900/95 px-2 py-2 backdrop-blur lg:hidden">
            {items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `focus-volt flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] ${isActive ? 'bg-coal-800 text-volt-400' : 'text-smoke-400'}`}>
                    <Icon size={20} strokeWidth={2} />
                    <span className="max-w-full truncate">{label}</span>
                </NavLink>
            ))}
        </nav>
        </>
    );
}
