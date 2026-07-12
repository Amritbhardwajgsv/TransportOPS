import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppShell({ children }) {
    return (
        <div className="flex min-h-dvh bg-coal-950 lg:h-screen">
            <Sidebar />
            <main className="min-w-0 flex-1 overflow-y-auto pt-16 pb-20 lg:pt-0 lg:pb-0">
                <div className="page-boundary mx-auto max-w-[90rem] py-5 sm:py-6">{children ?? <Outlet />}</div>
            </main>
        </div>
    );
}
