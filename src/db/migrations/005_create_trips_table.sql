CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seq SERIAL,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    cargo_weight_kg NUMERIC(10, 2) NOT NULL CHECK (cargo_weight_kg > 0),
    planned_distance_km NUMERIC(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'dispatched', 'completed', 'cancelled')),
    start_odometer_km NUMERIC(10, 2),
    end_odometer_km NUMERIC(10, 2),
    fuel_consumed_liters NUMERIC(10, 2),
    dispatched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
