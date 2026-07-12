const pool = require('../config/db');

function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function listCities() {
    const result = await pool.query('SELECT id, name, lat, lng FROM cities ORDER BY name');
    return result.rows;
}

async function findCityByName(name) {
    if (!name) return undefined;
    const result = await pool.query('SELECT id, name, lat, lng FROM cities WHERE LOWER(name) = LOWER($1)', [name]);
    return result.rows[0];
}

async function distanceBetweenCityNames(nameA, nameB) {
    const [a, b] = await Promise.all([findCityByName(nameA), findCityByName(nameB)]);
    if (!a || !b) return null;
    return Math.round(haversineKm(Number(a.lat), Number(a.lng), Number(b.lat), Number(b.lng)));
}

module.exports = { listCities, findCityByName, distanceBetweenCityNames, haversineKm };
