export const CITIES = [
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { name: 'Nashik', lat: 19.9975, lng: 73.7898 },
    { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { name: 'Aurangabad', lat: 19.8762, lng: 75.3433 },
    { name: 'Satara', lat: 17.6805, lng: 73.9997 },
];

export function findCity(name) {
    if (!name) return undefined;
    return CITIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function distanceBetweenCities(nameA, nameB) {
    const a = findCity(nameA);
    const b = findCity(nameB);
    if (!a || !b) return null;
    return Math.round(haversineKm(a.lat, a.lng, b.lat, b.lng));
}
