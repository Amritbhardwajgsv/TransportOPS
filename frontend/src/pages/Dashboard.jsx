import { useAuth } from '../context/AuthContext';
import FleetCommand from './homes/FleetCommand';
import DispatchDesk from './homes/DispatchDesk';
import ComplianceWatch from './homes/ComplianceWatch';
import CostConsole from './homes/CostConsole';

const HOMES = {
    fleet_manager: FleetCommand,
    driver: DispatchDesk,
    safety_officer: ComplianceWatch,
    financial_analyst: CostConsole,
};

export default function Dashboard() {
    const { user } = useAuth();
    const Home = HOMES[user.role];
    return Home ? <Home /> : null;
}
