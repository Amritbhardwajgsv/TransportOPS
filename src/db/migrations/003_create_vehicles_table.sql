CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    max_load_kg NUMERIC(10, 2) NOT NULL CHECK (max_load_kg > 0),
    odometer_km NUMERIC(10, 2) NOT NULL DEFAULT 0,
    acquisition_cost NUMERIC(12, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'on_trip', 'in_shop', 'retired')),
    photo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
