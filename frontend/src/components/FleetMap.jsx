import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS = {
    available: '#4ade80',
    on_trip: '#c6f432',
    in_shop: '#fb923c',
    retired: '#78716c',
};

export default function FleetMap({ vehicles }) {
    if (vehicles.length === 0) {
        return null;
    }

    const center = [vehicles[0].lat, vehicles[0].lng];

    return (
        <div className="h-72 overflow-hidden rounded-lg border border-coal-600 sm:h-80">
            <MapContainer center={center} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: '#1b1b1b' }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {vehicles.map((v) => (
                    <CircleMarker
                        key={v.id}
                        center={[v.lat, v.lng]}
                        radius={9}
                        pathOptions={{
                            color: STATUS_COLORS[v.status] ?? '#a8a29e',
                            fillColor: STATUS_COLORS[v.status] ?? '#a8a29e',
                            fillOpacity: 0.85,
                            weight: 2,
                        }}
                    >
                        <Popup>
                            <strong>{v.registrationNumber}</strong>
                            <br />
                            {v.model}
                            <br />
                            {v.city} · {v.status.replace('_', ' ')}
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
}
