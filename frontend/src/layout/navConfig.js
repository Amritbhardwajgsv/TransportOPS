import { LayoutDashboard, Truck, UserRound, Route, Wrench, Receipt, BarChart3 } from 'lucide-react';

export const NAV_ITEMS = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['fleet_manager', 'driver', 'safety_officer', 'financial_analyst'] },
    { to: '/vehicles', label: 'Vehicles', icon: Truck, roles: ['fleet_manager', 'driver', 'financial_analyst'] },
    { to: '/drivers', label: 'Drivers', icon: UserRound, roles: ['fleet_manager', 'driver', 'safety_officer'] },
    { to: '/trips', label: 'Trips', icon: Route, roles: ['fleet_manager', 'driver', 'safety_officer'] },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['fleet_manager'] },
    { to: '/expenses', label: 'Expenses', icon: Receipt, roles: ['fleet_manager', 'financial_analyst'] },
    { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['fleet_manager', 'financial_analyst'] },
];
