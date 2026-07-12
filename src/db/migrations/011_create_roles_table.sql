CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO roles (name, description) VALUES
    ('fleet_manager', 'Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency.'),
    ('driver', 'Creates trips, assigns vehicles and drivers, and monitors active deliveries.'),
    ('safety_officer', 'Ensures driver compliance, tracks license validity, and monitors safety scores.'),
    ('financial_analyst', 'Reviews operational expenses, fuel consumption, maintenance costs, and profitability.')
ON CONFLICT (name) DO NOTHING;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_fkey'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_role_fkey FOREIGN KEY (role) REFERENCES roles(name);
    END IF;
END $$;
