CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO cities (name, lat, lng) VALUES
    ('Pune', 18.5204, 73.8567),
    ('Mumbai', 19.0760, 72.8777),
    ('Nashik', 19.9975, 73.7898),
    ('Nagpur', 21.1458, 79.0882),
    ('Aurangabad', 19.8762, 75.3433),
    ('Satara', 17.6805, 73.9997)
ON CONFLICT (name) DO NOTHING;
