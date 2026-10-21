-- 1. System Admin User Seed
INSERT INTO users (id, uid, created_at, version) 
VALUES (0, '00000000-0000-0000-0000-000000000000', CURRENT_TIMESTAMP, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) 
VALUES (0, 'OFFICE_ADMIN'), (0, 'TRANSPORT_ADMIN')
ON CONFLICT DO NOTHING;

-- 2. Mock Vehicles (Linked via person_uid to workforce-service Persons)
INSERT INTO vehicles (
    id, uid, person_uid, license_plate, make, model, year_of_manufacture, color, 
    chassis_number, engine_number, engine_capacity_cc, seating_capacity, fuel_type, 
    vehicle_class, vrd_expiry_date, avatar_url, is_active, created_by, created_at, version
) VALUES 
(
    1, 
    'b0000000-0000-0000-0000-000000000001', 
    'a0000000-0000-0000-0000-000000000001', -- John Doe (Workforce)
    'AB 1234', 
    'TOYOTA', 
    'ALPHARD 350', 
    2022, 
    'WHITE', 
    'JT111JA0001234567', 
    '2GR-FE-9876543', 
    3456, 
    7, 
    'PETROL', 
    'PRIVATE_CAR', 
    '2027-03-14', 
    '/data/local/office/transport-service/vehicles/b0000000-0000-0000-0000-000000000001/avatar/avatar.webp', 
    TRUE, 
    0, 
    CURRENT_TIMESTAMP, 
    0
),
(
    2, 
    'b0000000-0000-0000-0000-000000000002', 
    'a0000000-0000-0000-0000-000000000002', -- Jane Smith (Workforce)
    'EV 8888', 
    'TESLA', 
    'MODEL Y', 
    2023, 
    'BLACK', 
    '5YJ3E1EB2MF123456', 
    '3D7-1234567', 
    NULL, 
    5, 
    'ELECTRIC', 
    'PRIVATE_CAR', 
    '2026-11-20', 
    '/data/local/office/transport-service/vehicles/b0000000-0000-0000-0000-000000000002/avatar/avatar.webp', 
    TRUE, 
    0, 
    CURRENT_TIMESTAMP, 
    0
),
(
    3, 
    'b0000000-0000-0000-0000-000000000003', 
    'a0000000-0000-0000-0000-000000000003', -- Bob Lee (Workforce)
    'LG 5678', 
    'MERCEDES-BENZ', 
    'SPRINTER 316', 
    2021, 
    'SILVER', 
    'WDB9066331S123456', 
    'OM651-7654321', 
    2143, 
    3, 
    'DIESEL', 
    'LIGHT_GOODS_VEHICLE', 
    '2026-10-30', -- Expiring soon (triggers warning badge in UI)
    '/data/local/office/transport-service/vehicles/b0000000-0000-0000-0000-000000000003/avatar/avatar.webp', 
    TRUE, 
    0, 
    CURRENT_TIMESTAMP, 
    0
);

-- 3. Vehicle Extended Details (Insurance & First Registration)
INSERT INTO vehicle_details (
    id, vehicle_id, insurance_policy_number, insurance_company, insurance_expiry_date, 
    first_registration_date, notes, created_by, created_at, version
) VALUES 
(
    1, 
    1, 
    'POL-HK-2022-9901', 
    'AXA General Insurance Hong Kong Ltd.', 
    '2027-03-14', 
    '2022-03-15', 
    'Company executive shuttle vehicle. Comprehensive coverage.', 
    0, 
    CURRENT_TIMESTAMP, 
    0
),
(
    2, 
    2, 
    'POL-HK-2023-4412', 
    'Zurich Insurance Company Ltd.', 
    '2026-11-20', 
    '2023-04-10', 
    'Fleet zero-emission electric vehicle with fast charging package.', 
    0, 
    CURRENT_TIMESTAMP, 
    0
),
(
    3, 
    3, 
    'POL-HK-2021-1189', 
    'QBE Insurance (Hong Kong) Limited', 
    '2026-10-30', 
    '2021-08-01', 
    'Logistics and equipment transport van. Scheduled for annual roadworthiness check.', 
    0, 
    CURRENT_TIMESTAMP, 
    0
);

-- 4. Verified Vehicle Registration Documents (VRD)
INSERT INTO vehicle_vrds (
    id, uid, vehicle_id, document_number, registration_mark, registered_owner_name, 
    registered_owner_address, issue_date, expiry_date, file_key, sha256, byte_size, 
    media_type, status, created_by, created_at, version
) VALUES 
(
    1, 
    'c0000000-0000-0000-0000-000000000001', 
    1, 
    'VRD-2022-088192', 
    'AB 1234', 
    'CHAN TAI MAN', 
    'FLAT A, 12/F, HAPPY BUILDING, HONG KONG', 
    '2022-03-15', 
    '2027-03-14', 
    'vehicles/b0000000-0000-0000-0000-000000000001/vrds/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.pdf', 
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 
    245760, 
    'application/pdf', 
    'ACTIVE', 
    0, 
    CURRENT_TIMESTAMP, 
    0
),
(
    2, 
    'c0000000-0000-0000-0000-000000000002', 
    2, 
    'VRD-2023-019941', 
    'EV 8888', 
    'LI SIU LING', 
    'FLAT B, 8/F, PEACE GARDEN, KOWLOON', 
    '2023-04-10', 
    '2026-11-20', 
    'vehicles/b0000000-0000-0000-0000-000000000002/vrds/b5a2c94298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852a112.pdf', 
    'b5a2c94298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852a112', 
    188416, 
    'application/pdf', 
    'ACTIVE', 
    0, 
    CURRENT_TIMESTAMP, 
    0
);

-- 5. Pending VRD Submissions in Approval Queue
INSERT INTO vrd_submissions (
    id, uid, vehicle_id, file_key, sha256, byte_size, media_type, ocr_raw_data, 
    status, created_by, created_at, version
) VALUES 
(
    1, 
    'd0000000-0000-0000-0000-000000000001', 
    3, 
    'staging/d0000000-0000-0000-0000-000000000001/scan_raw.pdf', 
    'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef', 
    312450, 
    'application/pdf', 
    '{
        "registrationMark": "LG 5678",
        "chassisNumber": "WDB9066331S123456",
        "engineNumber": "OM651-7654321",
        "make": "MERCEDES-BENZ",
        "model": "SPRINTER 316",
        "yearOfManufacture": 2021,
        "cylinderCapacity": 2143,
        "color": "SILVER",
        "registeredOwnerName": "LEE POK",
        "registeredOwnerAddress": "ROOM 5, 3/F, INDUSTRIAL CENTRE, KWUN TONG",
        "firstRegistrationDate": "2021-08-01",
        "licenceExpiryDate": "2027-10-29"
    }'::jsonb, 
    'PENDING', 
    0, 
    CURRENT_TIMESTAMP, 
    0
);
