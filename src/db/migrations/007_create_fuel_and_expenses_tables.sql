CREATE TABLE IF NOT EXISTS fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    liters NUMERIC(10, 2) NOT NULL CHECK (liters > 0),
    cost NUMERIC(12, 2) NOT NULL CHECK (cost >= 0),
    odometer_km NUMERIC(10, 2),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id),
    category VARCHAR(50) NOT NULL,
    description TEXT,
    cost NUMERIC(12, 2) NOT NULL CHECK (cost >= 0),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
