const pool = require('../config/db');
const { findCity } = require('../constants/cities');

async function countsByStatus(table) {
    const result = await pool.query(`SELECT status, COUNT(*)::int AS count FROM ${table} GROUP BY status`);
    const counts = {};
    result.rows.forEach((row) => {
        counts[row.status] = row.count;
    });
    return counts;
}

async function getSummary() {
    const [
        vehicleCounts,
        driverCounts,
        tripCounts,
        licenseRisk,
        fuelMonth,
        maintenanceTotal,
        expensesTotal,
        efficiency,
        costPerVehicle,
        expiredLicenses,
        vehiclesInShop,
        staleDrafts,
        underutilizedVehicles,
        activeTrips,
        recentFuel,
        recentExpenses,
        readyVehicles,
        readyDrivers,
        vehicleLocations,
    ] = await Promise.all([
        countsByStatus('vehicles'),
        countsByStatus('drivers'),
        countsByStatus('trips'),
        pool.query(
            `SELECT
                COUNT(*) FILTER (WHERE license_expiry < CURRENT_DATE)::int AS expired,
                COUNT(*) FILTER (WHERE license_expiry >= CURRENT_DATE AND license_expiry <= CURRENT_DATE + INTERVAL '30 days')::int AS expiring_soon
             FROM drivers`
        ),
        pool.query(`SELECT COALESCE(SUM(cost), 0)::numeric AS total FROM fuel_logs WHERE logged_at >= date_trunc('month', CURRENT_DATE)`),
        pool.query(`SELECT COALESCE(SUM(cost), 0)::numeric AS total FROM maintenance_records`),
        pool.query(`SELECT COALESCE(SUM(cost), 0)::numeric AS total FROM expenses`),
        pool.query(
            `SELECT
                COALESCE(SUM(end_odometer_km - start_odometer_km), 0)::numeric AS total_distance,
                (SELECT COALESCE(SUM(liters), 0) FROM fuel_logs)::numeric AS total_liters
             FROM trips WHERE status = 'completed' AND end_odometer_km IS NOT NULL AND start_odometer_km IS NOT NULL`
        ),
        pool.query(
            `SELECT v.id, v.registration_number,
                COALESCE(f.total_fuel, 0)::numeric AS fuel_cost,
                COALESCE(f.total_liters, 0)::numeric AS fuel_liters,
                COALESCE(m.total_maintenance, 0)::numeric AS maintenance_cost,
                COALESCE(t.total_distance, 0)::numeric AS total_distance
             FROM vehicles v
             LEFT JOIN (SELECT vehicle_id, SUM(cost) AS total_fuel, SUM(liters) AS total_liters FROM fuel_logs GROUP BY vehicle_id) f ON f.vehicle_id = v.id
             LEFT JOIN (SELECT vehicle_id, SUM(cost) AS total_maintenance FROM maintenance_records GROUP BY vehicle_id) m ON m.vehicle_id = v.id
             LEFT JOIN (SELECT vehicle_id, SUM(end_odometer_km - start_odometer_km) AS total_distance FROM trips WHERE status = 'completed' GROUP BY vehicle_id) t ON t.vehicle_id = v.id
             ORDER BY v.registration_number`
        ),
        pool.query(
            `SELECT id, name, license_number, license_expiry FROM drivers WHERE license_expiry < CURRENT_DATE ORDER BY license_expiry ASC`
        ),
        pool.query(`SELECT id, registration_number, model FROM vehicles WHERE status = 'in_shop' ORDER BY updated_at DESC`),
        pool.query(
            `SELECT id, ('TR-' || LPAD(seq::text, 3, '0')) AS trip_number, source, destination, created_at
             FROM trips WHERE status = 'draft' AND created_at < CURRENT_DATE ORDER BY created_at ASC`
        ),
        pool.query(
            `SELECT v.id, v.registration_number, v.model
             FROM vehicles v
             WHERE v.status != 'retired'
               AND NOT EXISTS (
                   SELECT 1 FROM trips t WHERE t.vehicle_id = v.id AND t.created_at > now() - INTERVAL '14 days'
               )
             ORDER BY v.registration_number`
        ),
        pool.query(
            `SELECT t.id, ('TR-' || LPAD(t.seq::text, 3, '0')) AS trip_number, t.source, t.destination, t.status,
                v.registration_number AS vehicle_registration, d.name AS driver_name
             FROM trips t
             JOIN vehicles v ON v.id = t.vehicle_id
             JOIN drivers d ON d.id = t.driver_id
             WHERE t.status = 'dispatched'
             ORDER BY t.dispatched_at DESC`
        ),
        pool.query(
            `SELECT f.id, f.liters, f.cost, f.logged_at, v.registration_number AS vehicle_registration
             FROM fuel_logs f JOIN vehicles v ON v.id = f.vehicle_id
             ORDER BY f.logged_at DESC LIMIT 5`
        ),
        pool.query(
            `SELECT e.id, e.category, e.description, e.cost, e.logged_at, v.registration_number AS vehicle_registration
             FROM expenses e LEFT JOIN vehicles v ON v.id = e.vehicle_id
             ORDER BY e.logged_at DESC LIMIT 5`
        ),
        pool.query(`SELECT COUNT(*)::int AS count FROM vehicles WHERE status = 'available'`),
        pool.query(`SELECT COUNT(*)::int AS count FROM drivers WHERE status = 'available' AND license_expiry >= CURRENT_DATE`),
        pool.query(
            `SELECT id, registration_number, model, status, current_location_city
             FROM vehicles WHERE status != 'retired' ORDER BY registration_number`
        ),
    ]);

    const activeVehicleCount =
        (vehicleCounts.available ?? 0) + (vehicleCounts.on_trip ?? 0) + (vehicleCounts.in_shop ?? 0);
    const onTripVehicleCount = vehicleCounts.on_trip ?? 0;
    const fleetUtilizationPct = activeVehicleCount > 0 ? Math.round((onTripVehicleCount / activeVehicleCount) * 100) : 0;

    const totalDistance = Number(efficiency.rows[0].total_distance);
    const totalLiters = Number(efficiency.rows[0].total_liters);
    const avgFuelEfficiencyKmPerLiter = totalLiters > 0 ? Number((totalDistance / totalLiters).toFixed(1)) : 0;

    const totalFuelCostMonth = Number(fuelMonth.rows[0].total);
    const totalMaintenanceCost = Number(maintenanceTotal.rows[0].total);
    const totalExpensesCost = Number(expensesTotal.rows[0].total);

    return {
        vehicles: {
            total: Object.values(vehicleCounts).reduce((a, b) => a + b, 0),
            available: vehicleCounts.available ?? 0,
            onTrip: vehicleCounts.on_trip ?? 0,
            inShop: vehicleCounts.in_shop ?? 0,
            retired: vehicleCounts.retired ?? 0,
        },
        drivers: {
            total: Object.values(driverCounts).reduce((a, b) => a + b, 0),
            available: driverCounts.available ?? 0,
            onTrip: driverCounts.on_trip ?? 0,
            offDuty: driverCounts.off_duty ?? 0,
            suspended: driverCounts.suspended ?? 0,
            expired: licenseRisk.rows[0].expired,
            expiringSoon: licenseRisk.rows[0].expiring_soon,
        },
        trips: {
            draft: tripCounts.draft ?? 0,
            dispatched: tripCounts.dispatched ?? 0,
            completed: tripCounts.completed ?? 0,
            cancelled: tripCounts.cancelled ?? 0,
        },
        fleetUtilizationPct,
        finance: {
            totalFuelCostMonth,
            totalMaintenanceCost,
            totalExpensesCost,
            totalOperationalCost: totalFuelCostMonth + totalMaintenanceCost + totalExpensesCost,
            avgFuelEfficiencyKmPerLiter,
        },
        costPerVehicle: costPerVehicle.rows,
        attention: {
            expiredLicenses: expiredLicenses.rows,
            vehiclesInShop: vehiclesInShop.rows,
            staleDrafts: staleDrafts.rows,
            underutilizedVehicles: underutilizedVehicles.rows,
        },
        activeTrips: activeTrips.rows,
        recentFuel: recentFuel.rows,
        recentExpenses: recentExpenses.rows,
        readyToRoll: {
            vehicles: readyVehicles.rows[0].count,
            drivers: readyDrivers.rows[0].count,
        },
        vehicleLocations: vehicleLocations.rows
            .filter((v) => v.current_location_city && findCity(v.current_location_city))
            .map((v) => {
                const city = findCity(v.current_location_city);
                return {
                    id: v.id,
                    registrationNumber: v.registration_number,
                    model: v.model,
                    status: v.status,
                    city: v.current_location_city,
                    lat: city.lat,
                    lng: city.lng,
                };
            }),
    };
}

module.exports = { getSummary };
