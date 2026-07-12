const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const healthRoutes = require('./routes/health.routes');
const vehiclesRoutes = require('./routes/vehicles.routes');
const driversRoutes = require('./routes/drivers.routes');
const tripsRoutes = require('./routes/trips.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const fuelRoutes = require('./routes/fuel.routes');
const expensesRoutes = require('./routes/expenses.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const citiesRoutes = require('./routes/cities.routes');
const rolesRoutes = require('./routes/roles.routes');
const vehicleDocumentsRoutes = require('./routes/vehicleDocuments.routes');
const notificationsRoutes = require('./routes/notifications.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '3mb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel-logs', fuelRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/vehicle-documents', vehicleDocumentsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
