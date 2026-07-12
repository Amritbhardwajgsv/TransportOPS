ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'driver'
    CHECK (role IN ('fleet_manager', 'driver', 'safety_officer', 'financial_analyst'));
