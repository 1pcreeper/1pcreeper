import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";

// Helper to map Gemini output to vehicle_class enum
function mapVehicleClass(vc: string): any {
  const v = (vc || '').toUpperCase().replace(/\s+/g, '_');
  const valid = ['PRIVATE_CAR', 'LIGHT_GOODS_VEHICLE', 'MEDIUM_GOODS_VEHICLE', 'HEAVY_GOODS_VEHICLE', 'MOTORCYCLE', 'BUS', 'MINIBUS', 'SPECIAL_PURPOSE'];
  return valid.includes(v) ? v : 'PRIVATE_CAR';
}

function mapFuelType(ft: string): any {
  const f = (ft || '').toUpperCase();
  const valid = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG'];
  return valid.includes(f) ? f : null;
}

function mapIdType(idType: string): any {
  const i = (idType || '').toUpperCase();
  const valid = ['HKID', 'PASSPORT', 'BUSINESS_REGISTRATION', 'OTHER'];
  return valid.includes(i) ? i : 'OTHER';
}

// ==========================================
// MOCK DATA IN-MEMORY STORE
// ==========================================
let MOCK_VEHICLES: any[] = [
  {
    id: 1,
    registrationMark: "AB1234",
    chassisNo: "VIN123456789",
    make: "TOYOTA",
    model: "COROLLA",
    yearOfManufacture: 2020,
    vehicleClass: "PRIVATE_CAR",
    personUid: "c9a646d3-9c61-4cc9-bc55-e7bb523bc789",
    color: "WHITE",
    engineNumber: "ENG-88392",
    seatCapacity: 5,
    grossVehicleWeightKg: 1500,
    cylinderCapacityCc: 1498,
    avatarUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2070",
    vrdExpiryDate: "2026-10-02",
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

let MOCK_PERSONS: any[] = [
  {
    uid: "c9a646d3-9c61-4cc9-bc55-e7bb523bc789",
    nameEnglish: "Chan Tai Man",
    nameChinese: "陳大文",
    mobileTel: "+852 9123 4567",
    officeTel: "+852 2345 6789",
    email: "taiman.chan@example.com",
    hkId: "A123456(7)",
    isActive: true
  },
  {
    uid: "e8b725c4-2d14-411a-9426-381a1795db21",
    nameEnglish: "Wong Ka Yan",
    nameChinese: "黃嘉欣",
    mobileTel: "+852 9876 5432",
    officeTel: "+852 2876 5432",
    email: "kayan.wong@example.com",
    hkId: "K987654(3)",
    isActive: true
  },
  {
    uid: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    nameEnglish: "Lee Chi Keung",
    nameChinese: "李志強",
    mobileTel: "+852 9654 3210",
    officeTel: "+852 2654 3210",
    email: "chikeung.lee@example.com",
    hkId: "Y567890(1)",
    isActive: true
  },
  {
    uid: "d290f1ee-6c54-4b01-90e6-d701748f0851",
    nameEnglish: "Cheung Wai Ming",
    nameChinese: "張偉明",
    mobileTel: "+852 9345 6781",
    officeTel: "+852 2345 6781",
    email: "waiming.cheung@example.com",
    hkId: "Z112233(4)",
    isActive: true
  }
];

let MOCK_VRDS: any[] = [
  {
    id: 1,
    vehicleId: 1,
    issueDate: "2023-01-01",
    licensingOffice: "Kowloon",
    ownerNameEn: "John Doe",
    ownerNameZh: "陳大文",
    idDocType: "HKID",
    idDocPrefix: "A",
    addressBuilding: "Flat 12B, Tower 2, Grand Horizon",
    addressStreet: "18 Nathan Road",
    addressDistrict: "Tsim Sha Tsui",
    addressTerritory: "Kowloon",
    isCurrent: true,
    minioPath: "s3://minio-local/hk-transport-vrd-bucket/vehicles/1/vrd_official_2023.pdf",
    fileName: "VRD_Official_2023.pdf",
    fileUrl: "/mock/VRD_Official_2023.pdf"
  }
];

let MOCK_VRD_SUBMISSIONS: any[] = [
  {
    id: 1,
    vehicleId: 1,
    fileName: "VRD_Renew_2024_Scan.pdf",
    fileSize: "1.8 MB",
    mimeType: "application/pdf",
    minioBucket: "hk-transport-vrd-bucket",
    minioObjectKey: "vehicles/1/vrd_renew_2024_scan.pdf",
    minioPath: "s3://minio-local/hk-transport-vrd-bucket/vehicles/1/vrd_renew_2024_scan.pdf",
    minioUrl: "http://localhost:9000/hk-transport-vrd-bucket/vehicles/1/vrd_renew_2024_scan.pdf",
    fileDataUrl: "",
    status: 'SUCCESS',
    stageText: 'OCR Extraction Complete (Awaiting Review)',
    uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    scannedData: {
      registrationMark: "AB1234",
      chassisNo: "VIN123456789",
      engineNo: "ENG-88392",
      make: "TOYOTA",
      model: "COROLLA",
      yearOfManufacture: "2020",
      vehicleClass: "PRIVATE_CAR",
      licensingOffice: "Kowloon",
      issueDate: "2024-05-18",
      ownerNameEn: "John Doe",
      ownerNameZh: "陳大文",
      idDocType: "HKID",
      idDocPrefix: "A",
      addressBuilding: "Unit 12B, Tower 2, Grand Horizon",
      addressStreet: "18 Cyberport Road",
      addressDistrict: "Pok Fu Lam",
      addressTerritory: "Hong Kong"
    }
  },
  {
    id: 2,
    vehicleId: 1,
    fileName: "VRD_Renewal_Pending_Scan.pdf",
    fileSize: "1.2 MB",
    mimeType: "application/pdf",
    minioBucket: "hk-transport-vrd-bucket",
    minioObjectKey: "vehicles/1/vrd_renewal_pending_scan.pdf",
    minioPath: "s3://minio-local/hk-transport-vrd-bucket/vehicles/1/vrd_renewal_pending_scan.pdf",
    minioUrl: "http://localhost:9000/hk-transport-vrd-bucket/vehicles/1/vrd_renewal_pending_scan.pdf",
    fileDataUrl: "",
    status: 'PENDING',
    stageText: 'OCR Background Processing',
    uploadedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    scannedData: {
      ownerNameEn: "Processing OCR Extraction...",
      issueDate: "2024-05-18",
      licensingOffice: "Kowloon"
    }
  }
];
let submissionIdCounter = 3;

let MOCK_LOGS: any[] = [
  {
    id: 1,
    vehicleId: 1,
    date: "2023-05-10",
    mileage: 12500,
    description: "Annual Service & Oil Change",
    cost: 1500
  }
];

let MOCK_FOLDERS: any[] = [
  { id: 1, vehicleId: 1, name: "Registration & Licensing", parent: null },
  { id: 2, vehicleId: 1, name: "Inspection & Maintenance", parent: null },
  { id: 3, vehicleId: 1, name: "Insurance & Policies", parent: null },
  { id: 4, vehicleId: 1, name: "Fuel & Trip Logs", parent: null },
  { id: 5, vehicleId: 1, name: "General", parent: null }
];

let folderIdCounter = 6;

let MOCK_FILES: any[] = [
  {
    id: 1,
    vehicleId: 1,
    fileName: "VRD_Official_2023.pdf",
    folder: "Registration & Licensing",
    fileType: "pdf",
    fileSize: "1.4 MB",
    uploadedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    fileUrl: "/mock/VRD_Official_2023.pdf",
    nasPath: "\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\1\\Registration & Licensing\\VRD_Official_2023.pdf"
  },
  {
    id: 2,
    vehicleId: 1,
    fileName: "Ownership_Declaration_Form.docx",
    folder: "Registration & Licensing",
    fileType: "docx",
    fileSize: "420 KB",
    uploadedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    fileUrl: "/mock/Ownership_Declaration_Form.docx",
    nasPath: "\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\1\\Registration & Licensing\\Ownership_Declaration_Form.docx"
  },
  {
    id: 3,
    vehicleId: 1,
    fileName: "Annual_Inspection_Report_2024.pdf",
    folder: "Inspection & Maintenance",
    fileType: "pdf",
    fileSize: "2.1 MB",
    uploadedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    fileUrl: "/mock/Annual_Inspection_Report_2024.pdf",
    nasPath: "\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\1\\Inspection & Maintenance\\Annual_Inspection_Report_2024.pdf"
  },
  {
    id: 4,
    vehicleId: 1,
    fileName: "Maintenance_Cost_Ledger.xlsx",
    folder: "Inspection & Maintenance",
    fileType: "xlsx",
    fileSize: "95 KB",
    uploadedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    fileUrl: "/mock/Maintenance_Cost_Ledger.xlsx",
    nasPath: "\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\1\\Inspection & Maintenance\\Maintenance_Cost_Ledger.xlsx"
  },
  {
    id: 5,
    vehicleId: 1,
    fileName: "Engine_Diagnostics_Telemetry.txt",
    folder: "Inspection & Maintenance",
    fileType: "txt",
    fileSize: "28 KB",
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    fileUrl: "/mock/Engine_Diagnostics_Telemetry.txt",
    nasPath: "\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\1\\Inspection & Maintenance\\Engine_Diagnostics_Telemetry.txt"
  },
  {
    id: 6,
    vehicleId: 1,
    fileName: "Comprehensive_Motor_Policy.pdf",
    folder: "Insurance & Policies",
    fileType: "pdf",
    fileSize: "3.4 MB",
    uploadedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    fileUrl: "/mock/Comprehensive_Motor_Policy.pdf",
    nasPath: "\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\1\\Insurance & Policies\\Comprehensive_Motor_Policy.pdf"
  },
  {
    id: 7,
    vehicleId: 1,
    fileName: "Monthly_Fuel_Consumption.xlsx",
    folder: "Fuel & Trip Logs",
    fileType: "xlsx",
    fileSize: "135 KB",
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    fileUrl: "/mock/Monthly_Fuel_Consumption.xlsx",
    nasPath: "\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\1\\Fuel & Trip Logs\\Monthly_Fuel_Consumption.xlsx"
  },
  {
    id: 8,
    vehicleId: 1,
    fileName: "Warranty_Terms_and_Delivery.docx",
    folder: "General",
    fileType: "docx",
    fileSize: "310 KB",
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    fileUrl: "/mock/Warranty_Terms_and_Delivery.docx",
    nasPath: "\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\1\\General\\Warranty_Terms_and_Delivery.docx"
  }
];
let vehicleIdCounter = 2;
let fileIdCounter = 9;
let vrdIdCounter = 2;

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Support standard Office API Gateway prefix /api/v1/transport and /api/v1/account
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/v1/transport/')) {
      req.url = '/api/' + req.url.slice('/api/v1/transport/'.length);
    } else if (req.url.startsWith('/api/v1/account/')) {
      req.url = '/api/' + req.url.slice('/api/v1/account/'.length);
    } else if (req.url.startsWith('/api/v1/')) {
      req.url = '/api/' + req.url.slice('/api/v1/'.length);
    }
    next();
  });

  // Setup Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Setup Multer (using memory storage for processing/cloud upload mockup)
  const upload = multer({ storage: multer.memoryStorage() });

  // Spring Boot Standard DTO Response Helpers
  function sendApiResponse(res: express.Response, data: any, message: string = "", statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  function sendApiError(res: express.Response, message: string = "An error occurred", statusCode: number = 500, data: any = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      data
    });
  }

  // Auth Login (Mock & Gateway compatible)
  app.post(["/api/auth/login", "/api/account/auth/login"], async (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@system.com" && password === "123123") {
      sendApiResponse(res, { token: "mock-jwt-token-admin", user: { uid: "admin-1", email, role: "TRANSPORT_ADMIN" } }, "Login successful");
    } else {
      sendApiError(res, "Invalid credentials", 401);
    }
  });

  // Auth Verify (Mock & Gateway compatible)
  app.get(["/api/auth/verify", "/api/account/auth/verify", "/api/transport/auth/verify"], requireAuth, async (req: AuthRequest, res) => {
    try {
      sendApiResponse(res, { uid: req.user!.uid, email: req.user!.email, role: 'TRANSPORT_ADMIN' }, "Token verified successfully");
    } catch (error: any) {
      console.error("Auth verify error:", error);
      sendApiError(res, error.message);
    }
  });

  // Get vehicles (with search)
  app.get(["/api/vehicles", "/api/vehicles/search"], requireAuth, async (req: AuthRequest, res) => {
    try {
      const search = (req.query.q as string) || (req.query.search as string); 
      let results = [...MOCK_VEHICLES];
      
      if (search) {
        const s = search.toLowerCase();
        results = results.filter(v => 
          (v.registrationMark && v.registrationMark.toLowerCase().includes(s)) ||
          (v.chassisNo && v.chassisNo.toLowerCase().includes(s)) ||
          (v.make && v.make.toLowerCase().includes(s)) ||
          (v.model && v.model.toLowerCase().includes(s))
        );
      }
      
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      sendApiResponse(res, results, "Vehicles retrieved successfully");
    } catch (error: any) {
      console.error("Failed to fetch vehicles:", error);
      sendApiError(res, "Failed to fetch vehicles");
    }
  });

  // Person lookup endpoints
  app.get(["/api/transport/persons/search", "/api/transport/persons", "/api/persons/search", "/api/persons", "/api/workforce/persons/search", "/api/workforce/persons"], requireAuth, async (req: AuthRequest, res) => {
    try {
      const q = (req.query.q as string || '').toLowerCase().trim();
      let results = [...MOCK_PERSONS];
      if (q) {
        results = results.filter(p =>
          (p.nameEnglish && p.nameEnglish.toLowerCase().includes(q)) ||
          (p.nameChinese && p.nameChinese.includes(q)) ||
          (p.hkId && p.hkId.toLowerCase().includes(q)) ||
          (p.uid && p.uid.toLowerCase().includes(q)) ||
          (p.email && p.email.toLowerCase().includes(q))
        );
      }
      sendApiResponse(res, results, "Persons retrieved successfully");
    } catch (error: any) {
      console.error("Failed to fetch persons:", error);
      sendApiError(res, "Failed to fetch persons");
    }
  });

  app.get(["/api/transport/persons/:uid", "/api/persons/:uid", "/api/workforce/persons/:uid"], requireAuth, async (req: AuthRequest, res) => {
    try {
      const person = MOCK_PERSONS.find(p => p.uid === req.params.uid);
      if (person) {
        sendApiResponse(res, person, "Person details retrieved");
      } else {
        sendApiError(res, "Person not found", 404);
      }
    } catch (error: any) {
      sendApiError(res, "Failed to fetch person details");
    }
  });

  // Create a new vehicle
  app.post("/api/vehicles", requireAuth, async (req: AuthRequest, res) => {
    try {
      const newVehicle = {
        id: vehicleIdCounter++,
        registrationMark: req.body.registrationMark || "UNKNOWN",
        chassisNo: req.body.chassisNo || "UNKNOWN",
        make: req.body.make || "UNKNOWN",
        model: req.body.model || "UNKNOWN",
        yearOfManufacture: parseInt(req.body.yearOfManufacture) || new Date().getFullYear(),
        vehicleClass: mapVehicleClass(req.body.vehicleClass),
        fuelType: mapFuelType(req.body.fuelType),
        seatCapacity: req.body.seatCapacity ? parseInt(req.body.seatCapacity) : null,
        grossVehicleWeightKg: req.body.grossVehicleWeightKg ? parseInt(req.body.grossVehicleWeightKg) : null,
        cylinderCapacityCc: req.body.cylinderCapacityCc ? parseInt(req.body.cylinderCapacityCc) : null,
        avatarUrl: req.body.avatarUrl || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2070",
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      MOCK_VEHICLES.push(newVehicle);
      sendApiResponse(res, newVehicle, "Vehicle created successfully", 201);
    } catch (error: any) {
      console.error("Failed to create vehicle:", error);
      sendApiError(res, "Failed to create vehicle");
    }
  });

  // Get single vehicle details
  app.get(["/api/vehicles/:id", "/api/vehicles/details/:id"], requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 5;
      
      const vehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
      if (!vehicle) {
        return sendApiError(res, "Vehicle not found", 404);
      }
      
      const vrds = MOCK_VRDS.filter(v => v.vehicleId === vehicleId).sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
      const logs = MOCK_LOGS.filter(l => l.vehicleId === vehicleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let allVehicleFiles = MOCK_FILES.filter(f => f.vehicleId === vehicleId).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      let vehicleFolders = MOCK_FOLDERS.filter(f => f.vehicleId === vehicleId);
      const totalFiles = allVehicleFiles.length;
      
      // Top 5 assets (files / folders) for the vehicle details view
      const topFiles = allVehicleFiles.slice(0, 5);

      const pendingVrdCount = MOCK_VRD_SUBMISSIONS.filter(s => s.vehicleId === vehicleId && s.status !== 'APPROVED' && s.status !== 'REJECTED').length;
      
      sendApiResponse(res, {
        ...vehicle,
        vrds,
        logs,
        files: topFiles,
        totalAssetsCount: totalFiles + vehicleFolders.length,
        foldersCount: vehicleFolders.length,
        filesCount: totalFiles,
        nasPath: `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${vehicle.id}`,
        pendingVrdCount
      }, "Vehicle details retrieved successfully");
    } catch (error: any) {
      console.error("Failed to fetch vehicle details:", error);
      sendApiError(res, "Failed to fetch vehicle details");
    }
  });

  // Update vehicle avatar (Requested: user can edit the car avatar)
  app.put("/api/vehicles/:id/avatar", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const { avatarUrl } = req.body;
      const vehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
      if (!vehicle) {
        return sendApiError(res, "Vehicle not found", 404);
      }

      vehicle.avatarUrl = avatarUrl || null;
      vehicle.updatedAt = new Date().toISOString();

      sendApiResponse(res, {
        id: vehicle.id,
        avatarUrl: vehicle.avatarUrl,
        updatedAt: vehicle.updatedAt
      }, "Vehicle avatar updated successfully");
    } catch (error: any) {
      console.error("Failed to update vehicle avatar:", error);
      sendApiError(res, error.message || "Failed to update vehicle avatar");
    }
  });

  // Update vehicle VRD expiry date (Requested: user can input or edit expiry date)
  app.put("/api/vehicles/:id/vrd-expiry", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const { vrdExpiryDate } = req.body;
      const vehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
      if (!vehicle) {
        return sendApiError(res, "Vehicle not found", 404);
      }

      vehicle.vrdExpiryDate = vrdExpiryDate || null;
      vehicle.updatedAt = new Date().toISOString();

      sendApiResponse(res, {
        id: vehicle.id,
        vrdExpiryDate: vehicle.vrdExpiryDate,
        updatedAt: vehicle.updatedAt
      }, "Vehicle VRD expiry date updated successfully");
    } catch (error: any) {
      console.error("Failed to update vehicle VRD expiry date:", error);
      sendApiError(res, error.message || "Failed to update vehicle VRD expiry date");
    }
  });

  // Update vehicle (general)
  app.put("/api/vehicles/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
      if (!vehicle) {
        return sendApiError(res, "Vehicle not found", 404);
      }

      Object.assign(vehicle, req.body, { updatedAt: new Date().toISOString() });
      sendApiResponse(res, vehicle, "Vehicle updated successfully");
    } catch (error: any) {
      console.error("Failed to update vehicle:", error);
      sendApiError(res, error.message || "Failed to update vehicle");
    }
  });

  // Delete vehicle
  app.delete("/api/vehicles/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const index = MOCK_VEHICLES.findIndex(v => v.id === vehicleId);
      if (index === -1) {
        return sendApiError(res, "Vehicle not found", 404);
      }
      MOCK_VEHICLES.splice(index, 1);
      sendApiResponse(res, null, "Vehicle deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete vehicle:", error);
      sendApiError(res, error.message || "Failed to delete vehicle");
    }
  });


  // Get full explorer data for vehicle
  app.get("/api/vehicles/:id/explorer", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
      if (!vehicle) {
        return sendApiError(res, "Vehicle not found", 404);
      }

      let folders = MOCK_FOLDERS.filter(f => f.vehicleId === vehicleId);
      let files = MOCK_FILES.filter(f => f.vehicleId === vehicleId).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      sendApiResponse(res, {
        vehicle: {
          id: vehicle.id,
          registrationMark: vehicle.registrationMark,
          make: vehicle.make,
          model: vehicle.model,
          chassisNo: vehicle.chassisNo,
          yearOfManufacture: vehicle.yearOfManufacture,
          vehicleClass: vehicle.vehicleClass,
          avatarUrl: vehicle.avatarUrl
        },
        nasRoot: `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${vehicle.id}`,
        folders,
        files
      }, "Explorer data retrieved successfully");
    } catch (error: any) {
      console.error("Failed to fetch explorer data:", error);
      sendApiError(res, "Failed to fetch explorer data");
    }
  });

  // Create folder in explorer (supports nested folders)
  app.post("/api/vehicles/:id/explorer/folders", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const { name, parent } = req.body;
      if (!name || !name.trim()) {
        return sendApiError(res, "Folder name is required", 400);
      }

      const cleanName = name.trim();
      const cleanParent = parent && parent.trim() ? parent.trim() : null;

      // Check if folder exists with the same parent
      const existing = MOCK_FOLDERS.find(f => 
        f.vehicleId === vehicleId && 
        (f.parent || null) === cleanParent && 
        f.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (existing) {
        return sendApiError(res, "A folder with this name already exists in this location", 400);
      }

      const newFolder = {
        id: folderIdCounter++,
        vehicleId,
        name: cleanName,
        parent: cleanParent
      };
      MOCK_FOLDERS.push(newFolder);
      sendApiResponse(res, newFolder, "Folder created successfully", 201);
    } catch (error: any) {
      console.error("Create folder error:", error);
      sendApiError(res, "Failed to create folder");
    }
  });

  // Create file in explorer (supports any format and uploaded file metadata)
  app.post("/api/vehicles/:id/explorer/files", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
      const { fileName, folder, fileType, content, fileSize, fileUrl } = req.body;

      if (!fileName || !fileName.trim()) {
        return sendApiError(res, "File name is required", 400);
      }

      const cleanFolder = folder || "General";
      let safeName = fileName.trim();
      let ext = fileType ? fileType.toLowerCase().replace(/^\./, '') : '';
      if (!ext) {
        ext = safeName.includes('.') ? safeName.split('.').pop()!.toLowerCase() : 'dat';
      }
      if (!safeName.toLowerCase().endsWith(`.${ext}`)) {
        safeName = `${safeName}.${ext}`;
      }

      const nasPath = `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${vehicleId}\\${cleanFolder}\\${safeName}`;

      let computedSize = fileSize;
      if (!computedSize) {
        if (['pdf'].includes(ext)) computedSize = '1.4 MB';
        else if (['docx', 'doc'].includes(ext)) computedSize = '340 KB';
        else if (['xlsx', 'xls', 'csv'].includes(ext)) computedSize = '120 KB';
        else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) computedSize = '2.1 MB';
        else if (['zip', 'rar', '7z', 'tar'].includes(ext)) computedSize = '5.6 MB';
        else if (['mp4', 'mov', 'avi'].includes(ext)) computedSize = '18.4 MB';
        else computedSize = '42 KB';
      }

      const newFile = {
        id: fileIdCounter++,
        vehicleId,
        fileName: safeName,
        folder: cleanFolder,
        fileType: ext,
        fileSize: computedSize,
        uploadedAt: new Date().toISOString(),
        fileUrl: fileUrl || `/mock/${safeName}`,
        nasPath,
        content: content || null
      };

      MOCK_FILES.push(newFile);
      sendApiResponse(res, newFile, "File created successfully", 201);
    } catch (error: any) {
      console.error("Create file error:", error);
      sendApiError(res, "Failed to create file");
    }
  });

  // Delete item (file or folder, including nested items) in explorer
  app.delete("/api/vehicles/:id/explorer/items", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      // Support params from both req.body and req.query
      const type = req.body?.type || req.query?.type;
      const id = req.body?.id || req.query?.id;
      const folderName = req.body?.folderName || req.body?.name || req.query?.folderName || req.query?.name;

      if (type === 'file' && id) {
        const fileIdNum = parseInt(id.toString());
        MOCK_FILES = MOCK_FILES.filter(f => !(f.vehicleId === vehicleId && f.id === fileIdNum));
        return sendApiResponse(res, { message: "File deleted successfully", deletedCount: 1 }, "File deleted successfully");
      } else if (type === 'folder' && (folderName || id)) {
        let targetName = folderName ? folderName.toString().trim() : '';
        if (!targetName && id) {
          const fObj = MOCK_FOLDERS.find(f => f.vehicleId === vehicleId && f.id === parseInt(id.toString()));
          if (fObj) targetName = fObj.name;
        }

        if (!targetName) {
          return sendApiError(res, "Folder name or folder id is required", 400);
        }

        // Collect all folder names to delete recursively (the folder and its nested descendants)
        const foldersToDelete = new Set<string>([targetName]);
        let added = true;
        while (added) {
          added = false;
          MOCK_FOLDERS.forEach(f => {
            if (f.vehicleId === vehicleId && f.parent && foldersToDelete.has(f.parent) && !foldersToDelete.has(f.name)) {
              foldersToDelete.add(f.name);
              added = true;
            }
          });
        }

        const countDeletedFolders = MOCK_FOLDERS.filter(f => f.vehicleId === vehicleId && foldersToDelete.has(f.name)).length;
        const countDeletedFiles = MOCK_FILES.filter(f => f.vehicleId === vehicleId && foldersToDelete.has(f.folder)).length;
        MOCK_FOLDERS = MOCK_FOLDERS.filter(f => !(f.vehicleId === vehicleId && foldersToDelete.has(f.name)));
        MOCK_FILES = MOCK_FILES.filter(f => !(f.vehicleId === vehicleId && foldersToDelete.has(f.folder)));
        return sendApiResponse(res, { 
          message: `Folder "${targetName}" and its contents deleted successfully`,
          deletedCount: countDeletedFolders + countDeletedFiles
        }, `Folder "${targetName}" and its contents deleted successfully`);
      }

      sendApiError(res, "Invalid delete request parameters. Specify type and id or folderName.", 400);
    } catch (error: any) {
      console.error("Delete item error:", error);
      sendApiError(res, "Failed to delete item");
    }
  });

  // Get File Preview Content (supports any format: pdf, docx, xlsx, csv, images, txt, code, binary)
  app.get("/api/files/:fileId/content", requireAuth, async (req: AuthRequest, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      const file = MOCK_FILES.find(f => f.id === fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const vehicle = MOCK_VEHICLES.find(v => v.id === file.vehicleId) || {
        registrationMark: "AB1234",
        make: "TOYOTA",
        model: "COROLLA",
        chassisNo: "VIN123456789",
        yearOfManufacture: 2020,
        vehicleClass: "PRIVATE_CAR",
        seatCapacity: 5,
        grossVehicleWeightKg: 1500,
        cylinderCapacityCc: 1498
      };

      const ext = (file.fileType || (file.fileName.includes('.') ? file.fileName.split('.').pop() : 'txt')).toLowerCase();

      let previewPayload: any = {
        id: file.id,
        fileName: file.fileName,
        fileType: ext,
        folder: file.folder,
        fileSize: file.fileSize || "1.2 MB",
        uploadedAt: file.uploadedAt,
        nasPath: file.nasPath || `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${vehicle.id}\\${file.folder}\\${file.fileName}`,
        rawContent: file.content || null
      };

      const imageExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
      const spreadsheetExtensions = ['xlsx', 'xls', 'csv'];
      const docExtensions = ['docx', 'doc'];
      const codeExtensions = ['json', 'xml', 'yaml', 'yml', 'js', 'ts', 'html', 'css', 'py', 'sh', 'sql'];

      if (ext === 'pdf') {
        previewPayload.pdfData = {
          documentTitle: file.fileName.replace(/_/g, ' ').replace(/\.pdf$/i, ''),
          certNo: `HKTD-CERT-${1000 + file.id}`,
          issueDate: new Date(file.uploadedAt).toLocaleDateString('en-GB'),
          licensingAuthority: "Transport Department, The Government of the HKSAR",
          status: "OFFICIALLY CERTIFIED & VERIFIED",
          particulars: {
            "Registration Mark": vehicle.registrationMark,
            "Class of Vehicle": (vehicle.vehicleClass || "PRIVATE_CAR").replace(/_/g, ' '),
            "Chassis / VIN": vehicle.chassisNo,
            "Make & Model": `${vehicle.make} ${vehicle.model}`,
            "Year of Manufacture": vehicle.yearOfManufacture,
            "Cylinder Capacity": `${vehicle.cylinderCapacityCc || 1498} c.c.`,
            "Permitted Gross Weight": `${vehicle.grossVehicleWeightKg || 1500} kg`,
            "Seating Capacity": `${vehicle.seatCapacity || 5} Persons`
          },
          remarks: "This vehicle document is digitally recorded on the Office NAS system and validated against Hong Kong Transport Licensing regulations."
        };
      } else if (docExtensions.includes(ext)) {
        previewPayload.docxData = {
          documentTitle: file.fileName.replace(/_/g, ' ').replace(/\.(docx|doc)$/i, ''),
          referenceNo: `MEMO/HKTD/${new Date().getFullYear()}/${100 + file.id}`,
          date: new Date(file.uploadedAt).toLocaleDateString('en-GB'),
          department: "Fleet Management & Regulatory Oversight Unit",
          to: "All Authorized Drivers & Transport Supervisors",
          from: "Principal Transport Logistics Officer",
          subject: `VEHICLE ASSET RECORD FOR [${vehicle.registrationMark}] - ${vehicle.make} ${vehicle.model}`,
          sections: [
            {
              heading: "1. Executive Summary",
              text: `This administrative memorandum serves as the governance asset documentation for vehicle registration mark ${vehicle.registrationMark} (Chassis: ${vehicle.chassisNo}). All operations must comply with Transport Department statutory guidelines.`
            },
            {
              heading: "2. Asset Particulars & Operational Scope",
              text: `The asset is designated under Class ${(vehicle.vehicleClass || 'PRIVATE_CAR').replace(/_/g, ' ')}. Authorized for municipal transport, routine logistical duty, and designated road routes across Kowloon, Hong Kong Island, and the New Territories.`
            },
            {
              heading: "3. Scheduled Servicing & Safety Compliance",
              text: `Mandatory preventative maintenance is required every 10,000 kilometers or 6 calendar months, whichever occurs earlier. All repair logs and parts invoices must be archived on the Office NAS folder immediately upon completion.`
            },
            {
              heading: "4. Notes / Particulars",
              text: file.content || "Approved and digitally archived on Office NAS storage node #01 with active audit trail."
            }
          ]
        };
      } else if (spreadsheetExtensions.includes(ext)) {
        previewPayload.xlsxData = {
          workbookName: file.fileName,
          sheets: [
            {
              sheetName: ext === 'csv' ? "CSV Data Records" : "Maintenance & Operating Costs",
              columns: ["Record ID", "Date", "Service Category", "Vendor / Garage", "Mileage (km)", "Cost (HKD)", "Approval Status"],
              rows: [
                ["REC-801", "2024-02-12", "Routine Synthetic Oil & Filter Service", "Kowloon Motors Ltd.", "12,400", "1,450.00", "APPROVED"],
                ["REC-802", "2024-04-18", "Brake Pad Replacement & Bleed", "Crown Fleet Maintenance", "14,850", "2,600.00", "APPROVED"],
                ["REC-803", "2024-06-25", "Air Filter & AC Antibacterial Cleansing", "Apex Auto Tech", "17,100", "880.00", "APPROVED"],
                ["REC-804", "2024-08-10", "Annual MOT Roadworthiness Inspection", "Transport Dept Center #4", "19,500", "580.00", "APPROVED"],
                ["REC-805", "2024-09-02", "Front Tire Replacement (Bridgestone x2)", "Tyre Master HK", "20,300", "1,980.00", "APPROVED"]
              ],
              summary: {
                "Total Records": "5 Records",
                "Aggregate Mileage": "7,900 km",
                "Total Expenditure": "$7,490.00 HKD"
              }
            }
          ]
        };
      } else if (imageExtensions.includes(ext)) {
        previewPayload.imageData = {
          fileName: file.fileName,
          format: ext.toUpperCase(),
          dimensions: "1920 x 1080 px",
          colorSpace: "RGB 24-bit",
          url: file.fileUrl && !file.fileUrl.startsWith('/mock/') ? file.fileUrl : null,
          placeholderDescription: `Asset Image Photograph for ${vehicle.registrationMark} (${file.fileName})`
        };
      } else if (codeExtensions.includes(ext) || ext === 'txt' || ext === 'log') {
        previewPayload.txtData = {
          title: file.fileName,
          format: ext.toUpperCase(),
          content: file.content || `======================================================================
HONG KONG TRANSPORT DEPARTMENT - VEHICLE ASSET RECORD
FILE: ${file.fileName} | EXTENSION: .${ext.toUpperCase()}
VEHICLE REGISTRATION: ${vehicle.registrationMark} | CHASSIS VIN: ${vehicle.chassisNo}
NAS REPOSITORY PATH: ${previewPayload.nasPath}
======================================================================
[${new Date(file.uploadedAt).toISOString()}] ASSET RECORD REGISTERED TO OFFICE NAS
STATUS: VERIFIED & SYNCHRONIZED
OWNER DEPARTMENT: TRANSPORT OPERATIONS UNIT

TECHNICAL PARAMETERS:
  - REGISTRATION MARK: ${vehicle.registrationMark}
  - MAKE & MODEL: ${vehicle.make} ${vehicle.model}
  - CHASSIS NUMBER: ${vehicle.chassisNo}
  - STORAGE DIRECTORY: ${file.folder}
  - FILE ALLOCATION: ${file.fileSize || '42 KB'}
  
NOTES & PARTICULARS:
${file.content ? file.content : "Standard system telemetry and document archival entry. All statutory compliance parameters intact."}
======================================================================`
        };
      } else {
        // Generic Binary / Archive / Audio / Video / CAD preview
        previewPayload.binaryData = {
          fileName: file.fileName,
          ext: ext.toUpperCase(),
          size: file.fileSize || "2.5 MB",
          nasPath: previewPayload.nasPath,
          mimeType: `application/octet-stream`,
          checksum: `SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`,
          description: file.content || `Registered Office NAS binary asset document.`
        };
      }

      sendApiResponse(res, previewPayload, "File preview retrieved successfully");
    } catch (error: any) {
      console.error("Fetch file content error:", error);
      sendApiError(res, "Failed to fetch file content");
    }
  });

  // File upload handler
  app.post("/api/uploads/hk_vrd_images", requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
    try {
      const file = req.file;
      const vehicleIdStr = req.body.vehicleId;
      const folderName = req.body.folder || 'General';
      if (!file) return sendApiError(res, "No file uploaded", 400);
      
      const mockUrl = `/uploads/mock_${Date.now()}_${file.originalname}`;
      let createdFile: any = null;
      
      if (vehicleIdStr) {
        const vehicleId = parseInt(vehicleIdStr);
        createdFile = {
          id: fileIdCounter++,
          vehicleId,
          fileUrl: mockUrl,
          fileType: file.mimetype,
          fileName: file.originalname,
          folder: folderName,
          uploadedAt: new Date().toISOString()
        };
        MOCK_FILES.push(createdFile);
      }
      
      sendApiResponse(res, { url: mockUrl, file: createdFile }, "File uploaded successfully", 201);
    } catch (error: any) {
      console.error("Upload error:", error);
      sendApiError(res, "Failed to upload file");
    }
  });

  // Move file endpoint
  app.put("/api/files/:fileId/move", requireAuth, async (req: AuthRequest, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      const { folder } = req.body;
      
      if (!folder) return sendApiError(res, "Folder name is required", 400);
      
      const file = MOCK_FILES.find(f => f.id === fileId);
      if (!file) return sendApiError(res, "File not found", 404);

      file.folder = folder;
      sendApiResponse(res, file, "File moved successfully");
    } catch (error: any) {
      console.error("Move error:", error);
      sendApiError(res, "Failed to move file");
    }
  });

  // Get VRD submissions waiting approval for a vehicle (PROCESSING & PENDING at first rows, then SUCCESS, then APPROVED)
  app.get("/api/vehicles/:id/vrd-submissions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const list = MOCK_VRD_SUBMISSIONS.filter(s => s.vehicleId === vehicleId);

      // Status priority: PROCESSING (1), PENDING (2), SUCCESS (3), APPROVED (4), REJECTED (5)
      list.sort((a, b) => {
        const getPriority = (status: string) => {
          if (status === 'PROCESSING') return 1;
          if (status === 'PENDING') return 2;
          if (status === 'SUCCESS') return 3;
          if (status === 'APPROVED') return 4;
          return 5;
        };
        const pDiff = getPriority(a.status) - getPriority(b.status);
        if (pDiff !== 0) return pDiff;
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });

      sendApiResponse(res, list, "VRD submissions retrieved successfully");
    } catch (error: any) {
      console.error("Fetch VRD submissions error:", error);
      sendApiError(res, "Failed to fetch VRD submissions");
    }
  });

  // Upload VRD to local MinIO Object Storage and perform OCR scan
  app.post("/api/vehicles/:id/scans/hk_vrds", requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
      const file = req.file;

      if (!file) {
        return sendApiError(res, "No VRD document file provided", 400);
      }

      const timestamp = Date.now();
      const safeFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const minioBucket = "hk-transport-vrd-bucket";
      const minioObjectKey = `vehicles/${vehicleId}/vrd_${timestamp}_${safeFileName}`;
      const minioPath = `s3://${minioBucket}/${minioObjectKey}`;
      const minioUrl = `http://minio.local:9000/${minioBucket}/${minioObjectKey}`;
      const base64Data = file.buffer.toString("base64");
      const fileDataUrl = `data:${file.mimetype};base64,${base64Data}`;

      let formattedSize = `${(file.size / 1024).toFixed(1)} KB`;
      if (file.size > 1024 * 1024) {
        formattedSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      }

      // Default extracted data fallback in case Gemini is offline or slow
      let scannedData: any = {
        issueDate: new Date().toISOString().split('T')[0],
        licensingOffice: "Kowloon Licensing Office",
        ownerNameEn: "WONG TAI MING",
        ownerNameZh: "黃大明",
        idDocType: "HKID",
        idDocPrefix: "K",
        addressBuilding: "Unit 802, Block A, Fortune Plaza",
        addressStreet: "68 Nathan Road",
        addressDistrict: "Tsim Sha Tsui",
        addressTerritory: "Kowloon",
        registrationMark: vehicle?.registrationMark || "AB1234",
        chassisNo: vehicle?.chassisNo || "VIN123456789",
        engineNo: vehicle?.engineNo || "ENG-998811",
        make: vehicle?.make || "TOYOTA",
        model: vehicle?.model || "COROLLA",
        yearOfManufacture: vehicle?.yearOfManufacture || 2021,
        vehicleClass: vehicle?.vehicleClass || "PRIVATE_CAR",
        fuelType: vehicle?.fuelType || "PETROL",
        seatCapacity: vehicle?.seatCapacity || 5,
        grossVehicleWeightKg: vehicle?.grossVehicleWeightKg || 1500,
        cylinderCapacityCc: vehicle?.cylinderCapacityCc || 1498
      };

      try {
        // Attempt OCR extraction with Gemini
        const geminiRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Extract Hong Kong Vehicle Registration Document (VRD) particulars. Return JSON with keys:
                  "document_info": {"issue_date": "YYYY-MM-DD", "licensing_office": ""},
                  "vehicle_particulars": {"registration_mark": "", "chassis_no": "", "engine_no": "", "make": "", "model": "", "year_of_manufacture": 2023, "vehicle_class": "", "fuel_type": "", "seat_capacity": 5, "permitted_gross_vehicle_weight_kg": 1500, "cylinder_capacity_cc": 1500},
                  "registered_owner": {"owner_name_en": "", "owner_name_zh": "", "identity_document_type": "", "identity_document_prefix": "", "address": {"building": "", "street": "", "district": "", "territory": ""}}`
                },
                { inlineData: { mimeType: file.mimetype, data: base64Data } }
              ]
            }
          ],
          config: { responseMimeType: "application/json" }
        });

        if (geminiRes.text) {
          const parsed = JSON.parse(geminiRes.text);
          const docInfo = parsed.document_info || {};
          const vp = parsed.vehicle_particulars || {};
          const ro = parsed.registered_owner || {};
          const addr = ro.address || {};

          if (docInfo.issue_date) scannedData.issueDate = docInfo.issue_date;
          if (docInfo.licensing_office) scannedData.licensingOffice = docInfo.licensing_office;
          if (ro.owner_name_en) scannedData.ownerNameEn = ro.owner_name_en;
          if (ro.owner_name_zh) scannedData.ownerNameZh = ro.owner_name_zh;
          if (ro.identity_document_type) scannedData.idDocType = mapIdType(ro.identity_document_type);
          if (ro.identity_document_prefix) scannedData.idDocPrefix = ro.identity_document_prefix;
          if (addr.building) scannedData.addressBuilding = addr.building;
          if (addr.street) scannedData.addressStreet = addr.street;
          if (addr.district) scannedData.addressDistrict = addr.district;
          if (addr.territory) scannedData.addressTerritory = addr.territory;
          if (vp.registration_mark) scannedData.registrationMark = vp.registration_mark;
          if (vp.chassis_no) scannedData.chassisNo = vp.chassis_no;
          if (vp.engine_no) scannedData.engineNo = vp.engine_no;
          if (vp.make) scannedData.make = vp.make;
          if (vp.model) scannedData.model = vp.model;
        }
      } catch (geminiError) {
        console.warn("Gemini OCR fallback triggered:", geminiError);
      }

      const newSubmission = {
        id: submissionIdCounter++,
        vehicleId,
        fileName: file.originalname,
        fileSize: formattedSize,
        mimeType: file.mimetype,
        minioBucket,
        minioObjectKey,
        minioPath,
        minioUrl,
        fileDataUrl,
        status: 'SUCCESS', // Successfully scanned, awaiting admin review and recommit
        stageText: 'OCR Extraction Complete (Awaiting Review)',
        uploadedAt: new Date().toISOString(),
        scannedData,
        approvedAt: null,
        approvedBy: null
      };

      MOCK_VRD_SUBMISSIONS.push(newSubmission);

      sendApiResponse(res, {
        submission: newSubmission
      }, "VRD successfully uploaded to local MinIO object storage and scanned", 201);
    } catch (error: any) {
      console.error("VRD scan upload error:", error);
      sendApiError(res, "Failed to upload and scan VRD document");
    }
  });

  // Update scanned data in a VRD submission
  app.put("/api/vehicles/:id/vrd-submissions/:subId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const subId = parseInt(req.params.subId);
      const { scannedData, status } = req.body;

      const submission = MOCK_VRD_SUBMISSIONS.find(s => s.vehicleId === vehicleId && s.id === subId);
      if (!submission) {
        return sendApiError(res, "VRD submission not found", 404);
      }

      if (scannedData) {
        submission.scannedData = { ...submission.scannedData, ...scannedData };
      }
      if (status) {
        submission.status = status;
      }

      sendApiResponse(res, submission, "VRD submission updated successfully");
    } catch (error: any) {
      console.error("Update VRD submission error:", error);
      sendApiError(res, "Failed to update VRD submission");
    }
  });

  // Confirm and approve VRD submission -> commits to official MOCK_VRDS records
  app.post("/api/vehicles/:id/vrd-submissions/:subId/approve", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const subId = parseInt(req.params.subId);
      const { scannedData } = req.body;

      const submission = MOCK_VRD_SUBMISSIONS.find(s => s.vehicleId === vehicleId && s.id === subId);
      if (!submission) {
        return sendApiError(res, "VRD submission not found", 404);
      }

      const finalData = scannedData || submission.scannedData;

      // Update submission status
      submission.status = 'APPROVED';
      submission.stageText = 'Approved & Committed to Vehicle Records';
      submission.approvedAt = new Date().toISOString();
      submission.approvedBy = req.user?.email || 'admin@system.com';
      submission.scannedData = finalData;

      // Create new official VRD record linked to MinIO object storage
      const newVrd = {
        id: vrdIdCounter++,
        vehicleId,
        issueDate: finalData.issueDate ? new Date(finalData.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        licensingOffice: finalData.licensingOffice || 'Kowloon',
        ownerNameEn: finalData.ownerNameEn || '',
        ownerNameZh: finalData.ownerNameZh || '',
        idDocType: mapIdType(finalData.idDocType),
        idDocPrefix: finalData.idDocPrefix || 'A',
        addressBuilding: finalData.addressBuilding || '',
        addressStreet: finalData.addressStreet || '',
        addressDistrict: finalData.addressDistrict || '',
        addressTerritory: finalData.addressTerritory || '',
        isCurrent: true,
        minioPath: submission.minioPath,
        fileName: submission.fileName,
        fileUrl: submission.fileDataUrl || `/mock/${submission.fileName}`,
        fileSize: submission.fileSize,
        submissionId: submission.id
      };

      MOCK_VRDS.push(newVrd);

      // Update vehicle particulars if updated/confirmed
      const vehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
      if (vehicle && finalData) {
        if (finalData.registrationMark) vehicle.registrationMark = finalData.registrationMark;
        if (finalData.chassisNo) vehicle.chassisNo = finalData.chassisNo;
        if (finalData.engineNo) vehicle.engineNo = finalData.engineNo;
        if (finalData.make) vehicle.make = finalData.make;
        if (finalData.model) vehicle.model = finalData.model;
        if (finalData.yearOfManufacture) vehicle.yearOfManufacture = parseInt(finalData.yearOfManufacture);
        if (finalData.vehicleClass) vehicle.vehicleClass = mapVehicleClass(finalData.vehicleClass);
      }

      sendApiResponse(res, {
        vrd: newVrd,
        submission
      }, "VRD successfully approved and committed to vehicle records");
    } catch (error: any) {
      console.error("Approve VRD submission error:", error);
      sendApiError(res, "Failed to approve VRD submission");
    }
  });

  // Decline and abandon VRD submission (Requested: admin can decline it in order to abandon this scan)
  app.post("/api/vehicles/:id/vrd-submissions/:subId/decline", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const subId = parseInt(req.params.subId);
      const { reason } = req.body || {};

      const submission = MOCK_VRD_SUBMISSIONS.find(s => Number(s.vehicleId) === Number(vehicleId) && Number(s.id) === Number(subId));
      if (!submission) {
        return sendApiError(res, "VRD submission not found", 404);
      }

      submission.status = 'REJECTED';
      submission.stageText = 'Declined & Abandoned by Admin';
      submission.declinedAt = new Date().toISOString();
      submission.declinedBy = req.user?.email || 'admin@system.com';
      if (reason) {
        submission.declineReason = reason;
      }

      sendApiResponse(res, {
        submission
      }, "VRD scan submission has been declined and abandoned successfully");
    } catch (error: any) {
      console.error("Decline VRD submission error:", error);
      sendApiError(res, "Failed to decline VRD submission");
    }
  });

  // Permanently delete/abandon VRD submission from queue
  app.delete("/api/vehicles/:id/vrd-submissions/:subId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const subId = parseInt(req.params.subId);
      const index = MOCK_VRD_SUBMISSIONS.findIndex(s => s.vehicleId === vehicleId && s.id === subId);
      if (index === -1) {
        return sendApiError(res, "VRD submission not found", 404);
      }
      const removed = MOCK_VRD_SUBMISSIONS.splice(index, 1)[0];
      sendApiResponse(res, { submission: removed }, "VRD scan submission abandoned and removed from queue");
    } catch (error: any) {
      console.error("Delete VRD submission error:", error);
      sendApiError(res, "Failed to abandon VRD submission");
    }
  });

  // Get all VRD records for a vehicle (sorted by issueDate descending)
  app.get("/api/vehicles/:id/vrds", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vrds = MOCK_VRDS
        .filter(v => v.vehicleId === vehicleId)
        .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
      sendApiResponse(res, vrds, "Vehicle VRD records retrieved successfully");
    } catch (error: any) {
      console.error("Fetch vehicle VRDs error:", error);
      sendApiError(res, "Failed to fetch VRDs");
    }
  });

  // Edit scanned data directly on an existing VRD record
  app.put("/api/vrds/:vrdId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vrdId = parseInt(req.params.vrdId);
      const vrd = MOCK_VRDS.find(v => v.id === vrdId);
      if (!vrd) {
        return sendApiError(res, "VRD record not found", 404);
      }

      const {
        issueDate, licensingOffice, ownerNameEn, ownerNameZh,
        idDocType, idDocPrefix, addressBuilding, addressStreet,
        addressDistrict, addressTerritory
      } = req.body;

      if (issueDate) vrd.issueDate = new Date(issueDate).toISOString().split('T')[0];
      if (licensingOffice) vrd.licensingOffice = licensingOffice;
      if (ownerNameEn !== undefined) vrd.ownerNameEn = ownerNameEn;
      if (ownerNameZh !== undefined) vrd.ownerNameZh = ownerNameZh;
      if (idDocType) vrd.idDocType = mapIdType(idDocType);
      if (idDocPrefix !== undefined) vrd.idDocPrefix = idDocPrefix;
      if (addressBuilding !== undefined) vrd.addressBuilding = addressBuilding;
      if (addressStreet !== undefined) vrd.addressStreet = addressStreet;
      if (addressDistrict !== undefined) vrd.addressDistrict = addressDistrict;
      if (addressTerritory !== undefined) vrd.addressTerritory = addressTerritory;

      sendApiResponse(res, { vrd }, "VRD record updated successfully");
    } catch (error: any) {
      console.error("Update VRD record error:", error);
      sendApiError(res, "Failed to update VRD record");
    }
  });

  // Global / Legacy Scan Endpoint
  app.post("/api/scans/hk_vrds", requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
    try {
      const file = req.file;
      if (!file) return sendApiError(res, "No file provided for scan", 400);
      
      const base64Data = file.buffer.toString("base64");
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Extract the details from this Hong Kong Vehicle Registration Document (VRD). Return JSON.` },
              { inlineData: { mimeType: file.mimetype, data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      const data = JSON.parse(text);
      sendApiResponse(res, { rawExtraction: data, structuredData: data }, "Scan processed successfully");
    } catch (error: any) {
      console.error("Scan error:", error);
      sendApiError(res, "Failed to process scan");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
