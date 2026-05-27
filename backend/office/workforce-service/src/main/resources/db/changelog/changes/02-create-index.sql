-- Organization Hierarchy
CREATE INDEX idx_organizations_company_id ON organizations(company_id);
CREATE INDEX idx_places_org_id ON places(org_id);
CREATE INDEX idx_working_periods_org_id ON working_periods(org_id);
CREATE INDEX idx_occupations_org_id ON occupations(org_id);

-- Staff Linkages
CREATE INDEX idx_staffs_company_id ON staffs(company_id);
CREATE INDEX idx_staffs_person_id ON staffs(person_id);
CREATE INDEX idx_staffs_org_id ON staffs(org_id);

-- Staff Occupations Linkages
CREATE INDEX idx_staff_occupations_staff_id ON staff_occupations(staff_id);
CREATE INDEX idx_staff_occupations_occupation_id ON staff_occupations(occupation_id);

-- Schedule Linkages
CREATE INDEX idx_schedules_place_id ON schedules(place_id);
CREATE INDEX idx_schedules_staff_id ON schedules(staff_id);

-- Rule Linkages
CREATE INDEX idx_place_wp_rules_place_id ON place_working_period_rules(place_id);
CREATE INDEX idx_place_wp_rules_wp_id ON place_working_period_rules(working_period_id);
CREATE INDEX idx_place_occ_rules_place_id ON place_occupation_rules(place_id);
CREATE INDEX idx_place_occ_rules_occ_id ON place_occupation_rules(occupation_id);

-- Schedule queries (Combining time range and status)
CREATE INDEX idx_schedules_time_range ON schedules(start_at, end_at);
CREATE INDEX idx_schedules_status ON schedules(status);

-- Working period lookups
CREATE INDEX idx_working_periods_times ON working_periods(start_at, end_at);

-- Enable the trigram extension (Requires Postgres superuser privileges)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Person Searches
CREATE INDEX idx_persons_name_en_trgm ON persons USING gin (lower(name_english) gin_trgm_ops);
CREATE INDEX idx_persons_name_zh_trgm ON persons USING gin (lower(name_chinese) gin_trgm_ops);
CREATE INDEX idx_persons_email_trgm ON persons USING gin (lower(email) gin_trgm_ops);

-- Company Searches
CREATE INDEX idx_companies_name_en_trgm ON companies USING gin (lower(name_english) gin_trgm_ops);
CREATE INDEX idx_companies_name_zh_trgm ON companies USING gin (lower(name_chinese) gin_trgm_ops);

-- Place Searches
CREATE INDEX idx_places_name_trgm ON places USING gin (lower(name) gin_trgm_ops);