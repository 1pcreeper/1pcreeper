-- Vehicle Core Indexes
CREATE UNIQUE INDEX idx_vehicles_license_plate ON vehicles (LOWER(license_plate)) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_person_uid ON vehicles (person_uid);
CREATE INDEX idx_vehicles_vrd_expiry ON vehicles (vrd_expiry_date) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_is_active ON vehicles (is_active);

-- Vehicle Details 1-to-1 Index
CREATE INDEX idx_vehicle_details_vehicle_id ON vehicle_details (vehicle_id);

-- Vehicle Registration Documents (VRD) Indexes
CREATE INDEX idx_vehicle_vrds_vehicle_id ON vehicle_vrds (vehicle_id);
CREATE INDEX idx_vehicle_vrds_expiry ON vehicle_vrds (expiry_date);
CREATE INDEX idx_vehicle_vrds_status ON vehicle_vrds (status);

-- VRD Submissions / Approval Queue Indexes
CREATE INDEX idx_vrd_submissions_status ON vrd_submissions (status);
CREATE INDEX idx_vrd_submissions_vehicle ON vrd_submissions (vehicle_id);

-- Enable Trigram Extension for Fast Fuzzy Searches (Plate, Make, Model)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_vehicles_plate_trgm ON vehicles USING gin (LOWER(license_plate) gin_trgm_ops);
CREATE INDEX idx_vehicles_make_trgm ON vehicles USING gin (LOWER(make) gin_trgm_ops);
CREATE INDEX idx_vehicles_model_trgm ON vehicles USING gin (LOWER(model) gin_trgm_ops);
