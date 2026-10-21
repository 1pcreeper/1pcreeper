-- 1. Create a System Admin User
INSERT INTO users (id, uid, created_at, version) 
VALUES (0, '00000000-0000-0000-0000-000000000000', CURRENT_TIMESTAMP, 0);

INSERT INTO user_roles (user_id, role) 
VALUES (0, 'WORKFORCE_ADMIN');

-- 2. Create the Security Company & Details
INSERT INTO companies (id, name_english, name_chinese, business_registration_number, email, tel, is_active, created_by, created_at,version)
VALUES (1, 'Shield Security Services Ltd.', '神盾保安服務有限公司', '12345678', 'admin@shieldsec.com', '+852 31234567', TRUE, 0, CURRENT_TIMESTAMP, 0);

INSERT INTO company_details (id, company_id, bio, address, industry, created_by, created_at, version)
VALUES (1, 1, 'Elite security guarding and patrol services.', '100 Security Tower, Wan Chai, HK', 'Security', 0, CURRENT_TIMESTAMP, 0);

-- 3. Create an Department (A specific branch or division)
INSERT INTO departments (id, company_id, name, bio, is_active, created_by, created_at, version)
VALUES (1, 1, 'Hong Kong Island Operations', 'Handles all high-security guarding on HK Island.', TRUE, 0, CURRENT_TIMESTAMP, 0);

-- 4. Create Places (The locations being guarded)
INSERT INTO places (id, depart_id, name, address, is_active, created_by, created_at, version)
VALUES 
(1, 1, 'Central Bank Plaza', '1 Finance Street, Central', TRUE, 0, CURRENT_TIMESTAMP, 0),
(2, 1, 'Ocean View Residential', '88 Repulse Bay Road', TRUE, 0, CURRENT_TIMESTAMP, 0);

-- 5. Create Working Periods (Security Shifts)
INSERT INTO working_periods (id, depart_id, start_at, end_at, name, is_active, created_by, created_at, version)
VALUES 
(1, 1, '08:00:00', '16:00:00', 'Day Shift', TRUE, 0, CURRENT_TIMESTAMP, 0),
(2, 1, '16:00:00', '00:00:00', 'Evening Shift', TRUE, 0, CURRENT_TIMESTAMP, 0),
(3, 1, '00:00:00', '08:00:00', 'Night Shift', TRUE, 0, CURRENT_TIMESTAMP, 0);

-- 6. Create Occupations (Guard Roles)
INSERT INTO occupations (id, depart_id, name, is_active, created_by, created_at, version)
VALUES 
(1, 1, 'Senior Security Officer', TRUE, 0, CURRENT_TIMESTAMP, 0),
(2, 1, 'Patrol Guard', TRUE, 0, CURRENT_TIMESTAMP, 0),
(3, 1, 'CCTV Monitor', TRUE, 0, CURRENT_TIMESTAMP, 0);

-- 7. Create Persons (The actual humans)
INSERT INTO persons (id, uid, name_english, name_chinese, mobile_tel, email, hk_id, is_active, created_by, created_at, version)
VALUES 
(1, 'a0000000-0000-0000-0000-000000000001', 'John Doe', '陳大文', '+852 91234561', 'john.doe@email.com', 'A123456(1)', TRUE, 0, CURRENT_TIMESTAMP, 0),
(2, 'a0000000-0000-0000-0000-000000000002', 'Jane Smith', '李小玲', '+852 91234562', 'jane.s@email.com', 'B234567(2)', TRUE, 0, CURRENT_TIMESTAMP, 0),
(3, 'a0000000-0000-0000-0000-000000000003', 'Bob Lee', '李博', '+852 91234563', 'bob.lee@email.com', 'C345678(3)', TRUE, 0, CURRENT_TIMESTAMP, 0);

INSERT INTO person_details (id, person_id, gender, nationality, created_by, created_at, version)
VALUES 
(1, 1, 'MALE', 'Hong Kong', 0, CURRENT_TIMESTAMP, 0),
(2, 2, 'FEMALE', 'Hong Kong', 0, CURRENT_TIMESTAMP, 0),
(3, 3, 'MALE', 'Hong Kong', 0, CURRENT_TIMESTAMP, 0);

-- 8. Hire Persons as Staff for the Department
INSERT INTO staffs (id, company_id, person_id, depart_id, cust_id, type, is_active, created_by, created_at, version)
VALUES 
(1, 1, 1, 1, 'STF-001', 'FULL_TIME', TRUE, 0, CURRENT_TIMESTAMP, 0), -- John
(2, 1, 2, 1, 'STF-002', 'PART_TIME', TRUE, 0, CURRENT_TIMESTAMP, 0), -- Jane
(3, 1, 3, 1, 'STF-003', 'FULL_TIME', TRUE, 0, CURRENT_TIMESTAMP, 0); -- Bob

INSERT INTO staff_details (id, staff_id, max_working_hrs, created_by, created_at, version)
VALUES 
(1, 1, 208, 0, CURRENT_TIMESTAMP, 0), -- John max 208 hrs/month
(2, 2, 100, 0, CURRENT_TIMESTAMP, 0), -- Jane max 100 hrs/month
(3, 3, 208, 0, CURRENT_TIMESTAMP, 0); -- Bob max 208 hrs/month

-- 9. Assign Roles to Staff (Staff Occupations)
INSERT INTO staff_occupations (id, staff_id, occupation_id, remark, created_by, created_at, version)
VALUES 
(1, 1, 1, 'Experienced team leader', 0, CURRENT_TIMESTAMP, 0), -- John is Senior Officer
(2, 2, 2, 'Excellent runner', 0, CURRENT_TIMESTAMP, 0),       -- Jane is Patrol Guard
(3, 3, 3, 'Eagle eyes', 0, CURRENT_TIMESTAMP, 0);             -- Bob is CCTV Monitor

-- 10. Configure Place Rules (Central Bank Plaza Requirements)
-- Overall: prefers Full Time, then Part Time, then Contract staff
INSERT INTO place_schedule_rules (id, place_id, created_by, created_at, version)
VALUES (1, 1, 0, CURRENT_TIMESTAMP, 0);

INSERT INTO place_schedule_rule_work_types (rule_id, work_type, priority_index)
VALUES (1, 'FULL_TIME', 0), (1, 'PART_TIME', 1), (1, 'CONTRACT', 2);

-- Occupation Rules: The Bank needs a Senior Officer on Mon & Tue, and a Patrol Guard on Mon
INSERT INTO place_occupation_rules (id, place_id, week_day, occupation_id, created_by, created_at, version)
VALUES
(1, 1, 1, 1, 0, CURRENT_TIMESTAMP, 0),
(2, 1, 2, 1, 0, CURRENT_TIMESTAMP, 0),
(3, 1, 1, 2, 0, CURRENT_TIMESTAMP, 0);

-- Period Rules: Day Shift staffing required per occupation rule
INSERT INTO place_working_period_rules (id, occupation_rule_id, working_period_id, person_count, created_by, created_at, version)
VALUES
(1, 1, 1, 1, 0, CURRENT_TIMESTAMP, 0),
(2, 2, 1, 1, 0, CURRENT_TIMESTAMP, 0),
(3, 3, 1, 1, 0, CURRENT_TIMESTAMP, 0);

-- 11. Staff Preferences
-- John prefers the Day Shift at Central Bank on Mondays (week_day = 1)
INSERT INTO staff_schedule_preferences (id, staff_id, place_id, week_day, working_period_id, priority_index, created_by, created_at, version)
VALUES (1, 1, 1, 1, 1, 100, 0, CURRENT_TIMESTAMP, 0);

-- 12. Generate a DRAFT Schedule based on preferences and rules
INSERT INTO schedules (id, start_at, end_at, place_id, staff_id, status, working_period_id, occupation_id, remark, created_by, created_at, version)
VALUES 
(1, CURRENT_DATE + INTERVAL '1 day 08:00:00', CURRENT_DATE + INTERVAL '1 day 16:00:00', 1, 1, 'DRAFT', 1, 1, 'System matched preference for John (Day Shift)', 0, CURRENT_TIMESTAMP, 0),
(2, CURRENT_DATE + INTERVAL '1 day 08:00:00', CURRENT_DATE + INTERVAL '1 day 16:00:00', 1, 2, 'DRAFT', 1, 2, 'System assigned Jane to fulfill patrol requirement', 0, CURRENT_TIMESTAMP, 0);

-- 13. Create Organizations (Incorporated legal contacts / corporate entities)
INSERT INTO organizations (id, uid, name_english, name_chinese, business_registration_number, secretary_license_number, email, tel, is_active, created_by, created_at, version)
VALUES
(1, 'b0000000-0000-0000-0000-000000000001', 'Apex Corporate Services Limited', '頂峰企業服務有限公司', '87654321', '654321', 'contact@apexcorp.hk', '+852 28881234', TRUE, 0, CURRENT_TIMESTAMP, 0),
(2, 'b0000000-0000-0000-0000-000000000002', 'Global Logistics & Guarding Alliance', '環球物流安保聯盟', '98765432', '123456', 'info@globalalliance.org', '+852 29995678', TRUE, 0, CURRENT_TIMESTAMP, 0);

INSERT INTO organization_details (id, org_id, bio, address, industry, created_by, created_at, version)
VALUES
(1, 1, 'Corporate secretarial and compliance services across APAC.', '20/F, Prosperity Tower, Central, HK', 'Corporate Services', 0, CURRENT_TIMESTAMP, 0),
(2, 2, 'Logistics support and guarding alliance for industrial sites.', '8 Harbour Industrial Road, Kwun Tong, HK', 'Logistics & Security', 0, CURRENT_TIMESTAMP, 0);

-- Note: Adjust sequences so Postgres doesn't get confused by the hardcoded IDs when saving new records later!
-- SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
SELECT setval('places_id_seq', (SELECT MAX(id) FROM places));
SELECT setval('working_periods_id_seq', (SELECT MAX(id) FROM working_periods));
SELECT setval('occupations_id_seq', (SELECT MAX(id) FROM occupations));
SELECT setval('persons_id_seq', (SELECT MAX(id) FROM persons));
SELECT setval('organizations_id_seq', (SELECT MAX(id) FROM organizations));
SELECT setval('staffs_id_seq', (SELECT MAX(id) FROM staffs));
SELECT setval('schedules_id_seq', (SELECT MAX(id) FROM schedules));
SELECT setval('company_details_id_seq', (SELECT MAX(id) FROM company_details));
SELECT setval('organization_details_id_seq', (SELECT MAX(id) FROM organization_details));
SELECT setval('person_details_id_seq', (SELECT MAX(id) FROM person_details));
SELECT setval('staff_details_id_seq', (SELECT MAX(id) FROM staff_details));
SELECT setval('staff_occupations_id_seq', (SELECT MAX(id) FROM staff_occupations));
SELECT setval('place_schedule_rules_id_seq', (SELECT MAX(id) FROM place_schedule_rules));
SELECT setval('place_working_period_rules_id_seq', (SELECT MAX(id) FROM place_working_period_rules));
SELECT setval('place_occupation_rules_id_seq', (SELECT MAX(id) FROM place_occupation_rules));
SELECT setval('staff_schedule_preferences_id_seq', (SELECT MAX(id) FROM staff_schedule_preferences));