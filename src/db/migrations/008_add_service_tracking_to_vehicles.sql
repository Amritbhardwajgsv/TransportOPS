ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS last_service_odometer_km NUMERIC(10, 2) NOT NULL DEFAULT 0;
