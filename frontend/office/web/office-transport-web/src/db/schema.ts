import { pgTable, serial, text, integer, boolean, timestamp, date, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ENUMS
export const fuelTypeEnum = pgEnum('fuel_type', ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG']);
export const ownerTypeEnum = pgEnum('owner_type', ['PERSON', 'COMPANY']);
export const identityDocumentTypeEnum = pgEnum('identity_document_type', ['HKID', 'PASSPORT', 'BUSINESS_REGISTRATION', 'OTHER']);
export const vehicleClassEnum = pgEnum('vehicle_class', [
  'PRIVATE_CAR', 
  'LIGHT_GOODS_VEHICLE', 
  'MEDIUM_GOODS_VEHICLE', 
  'HEAVY_GOODS_VEHICLE', 
  'MOTORCYCLE', 
  'BUS', 
  'MINIBUS', 
  'SPECIAL_PURPOSE'
]);

// USERS TABLE
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  version: integer('version').default(1),
  uid: text('uid').notNull().unique(),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

export const userRoles = pgTable('user_roles', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull()
});

// VEHICLES TABLE
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  version: integer('version').default(1),
  
  // Auditable
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'cascade' }),
  updatedBy: integer('updated_by').references(() => users.id, { onDelete: 'cascade' }),
  
  registrationMark: text('registration_mark').notNull().unique(),
  chassisNo: text('chassis_no').notNull().unique(),
  engineNo: text('engine_no'),
  make: text('make').notNull(),
  model: text('model').notNull(),
  yearOfManufacture: integer('year_of_manufacture'),
  vehicleClass: vehicleClassEnum('v_class').notNull(),
  bodyType: text('body_type'),
  color: text('color'),
  firstRegistrationDate: date('first_registration_date'),
  fuelType: fuelTypeEnum('fuel'),
  seatCapacity: integer('seat_capacity'),
  grossVehicleWeightKg: integer('gross_vehicle_weight_kg'),
  cylinderCapacityCc: integer('cylinder_capacity_cc'),
  avatarUrl: text('avatar_url'),
  
  ownerUid: text('owner_uid'), 
  ownerType: ownerTypeEnum('o_type'),
  
  isActive: boolean('is_active').default(true)
});

// HK VRD TABLE
export const hkVrds = pgTable('hk_vrds', {
  id: serial('id').primaryKey(),
  version: integer('version').default(1),
  
  // Auditable
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'cascade' }),
  updatedBy: integer('updated_by').references(() => users.id, { onDelete: 'cascade' }),
  
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  issueDate: date('issue_date').notNull(),
  licensingOffice: text('licensing_office'),
  
  ownerNameEn: text('owner_name_en'),
  ownerNameZh: text('owner_name_zh'),
  idDocType: identityDocumentTypeEnum('id_doc_type'),
  idDocPrefix: text('id_doc_prefix'),
  
  addressBuilding: text('address_building'),
  addressStreet: text('address_street'),
  addressDistrict: text('address_district'),
  addressTerritory: text('address_territory'),
  
  isCurrent: boolean('is_current').default(true)
}, (table) => [
  uniqueIndex('idx_single_current_vrd').on(table.vehicleId).where(sql`${table.isCurrent} = true`)
]);

// Maintenance Logs Table (Requested: "repair logs, and mileage tracking features")
export const maintenanceLogs = pgTable('maintenance_logs', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  mileage: integer('mileage').notNull(),
  description: text('description').notNull(),
  cost: integer('cost'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'cascade' })
});

// File Records Table (Requested: "file records againest each vehicle")
export const vehicleFiles = pgTable('vehicle_files', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type'), // e.g. "image/jpeg", "application/pdf"
  fileName: text('file_name'),
  folder: text('folder').default('General'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  uploadedBy: integer('uploaded_by').references(() => users.id, { onDelete: 'cascade' })
});

// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  vehiclesCreated: many(vehicles, { relationName: 'createdBy' }),
  vehiclesUpdated: many(vehicles, { relationName: 'updatedBy' }),
  hkVrdsCreated: many(hkVrds, { relationName: 'createdBy' }),
  hkVrdsUpdated: many(hkVrds, { relationName: 'updatedBy' }),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  vrds: many(hkVrds),
  maintenanceLogs: many(maintenanceLogs),
  files: many(vehicleFiles),
  creator: one(users, { fields: [vehicles.createdBy], references: [users.id], relationName: 'createdBy' }),
  updater: one(users, { fields: [vehicles.updatedBy], references: [users.id], relationName: 'updatedBy' })
}));

export const hkVrdsRelations = relations(hkVrds, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [hkVrds.vehicleId],
    references: [vehicles.id],
  }),
  creator: one(users, { fields: [hkVrds.createdBy], references: [users.id], relationName: 'createdBy' }),
  updater: one(users, { fields: [hkVrds.updatedBy], references: [users.id], relationName: 'updatedBy' })
}));
