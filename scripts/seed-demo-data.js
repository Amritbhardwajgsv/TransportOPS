require('dotenv').config();
const pool = require('../src/config/db');

async function seed() {
    await pool.query('TRUNCATE trips, maintenance_records, fuel_logs, expenses, drivers, vehicles RESTART IDENTITY CASCADE');

    const vehicles = [
        ['MH12AB1234', 'Tata 1109', 'truck', 5000, 12400, 1500000, 'available'],
        ['MH14XY5566', 'Eicher Pro 2049', 'truck', 4000, 8200, 1800000, 'available'],
        ['KA05MZ9988', 'Ashok Leyland Dost', 'van', 1500, 21000, 900000, 'available'],
        ['MH20CD4321', 'Mahindra Bolero Pickup', 'pickup', 1000, 34500, 700000, 'in_shop'],
        ['MH01EF7788', 'Tata Ace', 'van', 750, 5400, 550000, 'available'],
    ];
    const vehicleIds = {};
    for (const [reg, model, type, maxLoad, odometer, cost, status] of vehicles) {
        const res = await pool.query(
            `INSERT INTO vehicles (registration_number, model, type, max_load_kg, odometer_km, acquisition_cost, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
            [reg, model, type, maxLoad, odometer, cost, status]
        );
        vehicleIds[reg] = res.rows[0].id;
    }

    const drivers = [
        ['Ramesh Kumar', 'DL-1420110012345', '2027-06-01', 96, 'available'],
        ['Suresh Yadav', 'DL-0420230098765', '2026-08-01', 88, 'available'],
        ['Vijay Singh', 'DL-0920180011223', '2028-01-01', 100, 'available'],
        ['Anil Sharma', 'DL-0320190055443', '2025-03-15', 72, 'available'],
        ['Deepak Verma', 'DL-0620210033221', '2027-11-20', 45, 'suspended'],
    ];
    const driverIds = {};
    for (const [name, license, expiry, score, status] of drivers) {
        const res = await pool.query(
            `INSERT INTO drivers (name, license_number, license_expiry, safety_score, status)
             VALUES ($1,$2,$3,$4,$5) RETURNING id`,
            [name, license, expiry, score, status]
        );
        driverIds[name] = res.rows[0].id;
    }

    async function trip(source, destination, vehicleReg, driverName, cargoKg, distanceKm, status, opts = {}) {
        const res = await pool.query(
            `INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
            [source, destination, vehicleIds[vehicleReg], driverIds[driverName], cargoKg, distanceKm, status]
        );
        const id = res.rows[0].id;
        if (status === 'completed') {
            await pool.query(
                `UPDATE trips SET start_odometer_km=$1, end_odometer_km=$2, fuel_consumed_liters=$3, dispatched_at=now()-interval '2 days', completed_at=now()-interval '1 day' WHERE id=$4`,
                [opts.start, opts.end, opts.fuel, id]
            );
        } else if (status === 'dispatched') {
            await pool.query(`UPDATE trips SET start_odometer_km=$1, dispatched_at=now()-interval '3 hours' WHERE id=$2`, [
                opts.start,
                id,
            ]);
        }
        return id;
    }

    await trip('Pune', 'Mumbai', 'MH12AB1234', 'Ramesh Kumar', 4000, 150, 'completed', { start: 12000, end: 12150, fuel: 18 });
    await trip('Mumbai', 'Nashik', 'MH14XY5566', 'Suresh Yadav', 2500, 180, 'completed', { start: 8000, end: 8180, fuel: 22 });
    await trip('Pune', 'Nagpur', 'KA05MZ9988', 'Vijay Singh', 1200, 700, 'dispatched', { start: 21000 });
    await pool.query(`UPDATE vehicles SET status = 'on_trip' WHERE id = $1`, [vehicleIds['KA05MZ9988']]);
    await pool.query(`UPDATE drivers SET status = 'on_trip' WHERE id = $1`, [driverIds['Vijay Singh']]);
    await trip('Nashik', 'Aurangabad', 'MH01EF7788', 'Anil Sharma', 600, 250, 'draft');
    await trip('Pune', 'Satara', 'MH12AB1234', 'Suresh Yadav', 3000, 110, 'cancelled');

    await pool.query(
        `INSERT INTO maintenance_records (vehicle_id, description, cost, status, opened_at)
         VALUES ($1, 'Brake pad replacement and wheel alignment', 6200, 'open', now() - interval '1 day')`,
        [vehicleIds['MH20CD4321']]
    );
    await pool.query(
        `INSERT INTO maintenance_records (vehicle_id, description, cost, status, opened_at, closed_at)
         VALUES ($1, 'Oil change and filter service', 2100, 'closed', now() - interval '10 days', now() - interval '9 days')`,
        [vehicleIds['MH12AB1234']]
    );

    const fuelLogs = [
        ['MH12AB1234', 40, 3600, 12150],
        ['MH14XY5566', 35, 3150, 8180],
        ['KA05MZ9988', 20, 1800, 21000],
        ['MH12AB1234', 38, 3420, 12400],
    ];
    for (const [reg, liters, cost, odo] of fuelLogs) {
        await pool.query(
            `INSERT INTO fuel_logs (vehicle_id, liters, cost, odometer_km, logged_at) VALUES ($1,$2,$3,$4, now() - interval '2 days')`,
            [vehicleIds[reg], liters, cost, odo]
        );
    }

    const expenses = [
        ['MH12AB1234', 'toll', 'Mumbai-Pune expressway', 320],
        ['MH14XY5566', 'permit', 'Interstate permit renewal', 1500],
        [null, 'insurance', 'Fleet insurance premium (quarterly)', 18000],
        ['KA05MZ9988', 'fine', 'Overloading fine', 2000],
    ];
    for (const [reg, category, description, cost] of expenses) {
        await pool.query(
            `INSERT INTO expenses (vehicle_id, category, description, cost, logged_at) VALUES ($1,$2,$3,$4, now() - interval '3 days')`,
            [reg ? vehicleIds[reg] : null, category, description, cost]
        );
    }

    console.log('Seed complete:', {
        vehicles: vehicles.length,
        drivers: drivers.length,
        trips: 5,
        maintenance: 2,
        fuelLogs: fuelLogs.length,
        expenses: expenses.length,
    });
    await pool.end();
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
