ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS current_location_city VARCHAR(50);
