import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppShell() {
    return (
        <div className="flex h-screen bg-coal-950">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
