import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppShell from './layout/AppShell';
import RequireRole from './layout/RequireRole';
import { NAV_ITEMS } from './layout/navConfig';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Cities from './pages/Cities';
import ThemeToggle from './components/ThemeToggle';
import Register from "./pages/Register"; // adjust path to match your folder structure


function roleRoles(path) {
    return NAV_ITEMS.find((item) => item.to === path).roles;
}

function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-coal-950 text-smoke-400">Loading…</div>;
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function RootRoute() {
    const { user, loading } = useAuth();
    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-coal-950 text-smoke-400">Loading…</div>;
    }
    if (!user) {
        return <Landing />;
    }
    return (
        <AppShell>
            <Dashboard />
        </AppShell>
    );
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                element={
                    <RequireAuth>
                        <AppShell />
                    </RequireAuth>
                }
            >
                <Route
                    path="/vehicles"
                    element={
                        <RequireRole roles={roleRoles('/vehicles')}>
                            <Vehicles />
                        </RequireRole>
                    }
                />
                <Route
                    path="/drivers"
                    element={
                        <RequireRole roles={roleRoles('/drivers')}>
                            <Drivers />
                        </RequireRole>
                    }
                />
                <Route
                    path="/trips"
                    element={
                        <RequireRole roles={roleRoles('/trips')}>
                            <Trips />
                        </RequireRole>
                    }
                />
                <Route
                    path="/maintenance"
                    element={
                        <RequireRole roles={roleRoles('/maintenance')}>
                            <Maintenance />
                        </RequireRole>
                    }
                />
                <Route
                    path="/expenses"
                    element={
                        <RequireRole roles={roleRoles('/expenses')}>
                            <Expenses />
                        </RequireRole>
                    }
                />
                <Route
                    path="/reports"
                    element={
                        <RequireRole roles={roleRoles('/reports')}>
                            <Reports />
                        </RequireRole>
                    }
                />
                <Route
                    path="/cities"
                    element={
                        <RequireRole roles={roleRoles('/cities')}>
                            <Cities />
                        </RequireRole>
                    }
                />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <ThemeToggle />
                    <AppRoutes />
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
