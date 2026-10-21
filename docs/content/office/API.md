# Office Enterprise System — API Contract & Service Specification

## 1. Common Response & Envelope Protocol

All REST endpoints across `office-api-gateway` (`/api/v1/*`) strictly enforce the standardized response envelope:

```ts
export interface APIBaseResponseDTO<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: Record<string, any>;
}

export interface PaginationBaseResponseDTO<T> {
    content: T[];
    pageNumber: number; // 0-based index
    pageSize: number;   // default 10 or 20
    totalPages: number;
    totalElements: number;
}
```

### JSON Success Example
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 101,
        "uid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "licensePlate": "AB 1234",
        "make": "Toyota",
        "model": "Alphard",
        "year": 2023,
        "personUid": "c9a646d3-9c61-4cc9-bc55-e7bb523bc789",
        "isActive": true
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalPages": 1,
    "totalElements": 1
  }
}
```

### JSON Failure Example
```json
{
  "success": false,
  "message": "Vehicle with license plate AB 1234 already exists",
  "data": null
}
```

HTTP status codes map directly to semantics:
- `200 OK` / `202 Accepted`: Request succeeded.
- `400 Bad Request`: Property validation error (caught by `PropertyValidationException`).
- `401 Unauthorized`: Token missing or expired (`TokenValidationException`).
- `403 Forbidden`: Insufficient role permissions (`AccessDeniedException`).
- `404 Not Found`: Resource non-existent or soft-deleted (`ResourceNotFoundException`).
- `409 Conflict`: Unique constraint violation (`DatabaseUpdateFailureException`).

---

## 2. Frontend Singleton Service Pattern

Frontend applications (`office-workforce-web`, `office-transport-web`) consume endpoints using dedicated **Singleton Content Services** injecting `officeAPI`.

### Core Client (`api/office.api.ts`)
```ts
import { apiRequest } from "./index";
import { VITE_OFFICE_BASE_URL } from "../config/env.config";
import { APIBaseResponseDTO } from "../models/dto/base/base.dto";
import { APIRequestError } from "../models/errors/api.error";

const OFFICE_BASE_PATH = "/api/v1";

const officeAPI = async <P, R>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: P,
    requiresAuth: boolean = false,
    ignoreCredentials: boolean = false
): Promise<R> => {
    const url = VITE_OFFICE_BASE_URL + OFFICE_BASE_PATH + path;
    const response = await apiRequest<P, APIBaseResponseDTO<R>>(
        url, method, data, requiresAuth, ignoreCredentials
    );
    if (!response.success) {
        throw new APIRequestError(response.message);
    }
    return response.data;
};
export default officeAPI;
```

### Singleton Service Implementation (`VehicleContentService.ts`)
```ts
import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { 
    VehicleCreateRequestDTO, 
    VehicleUpdateRequestDTO 
} from "@/models/dto/office/transport/request.dto";
import { 
    VehicleResponseDTO, 
    VehicleDetailResponseDTO 
} from "@/models/dto/office/transport/response.dto";

export default class VehicleContentService {
    private static INSTANCE: VehicleContentService;

    private constructor() {}

    public static getInstance(): VehicleContentService {
        if (!VehicleContentService.INSTANCE) {
            VehicleContentService.INSTANCE = new VehicleContentService();
        }
        return VehicleContentService.INSTANCE;
    }

    public async findAll(page: PageParams): Promise<PaginationBaseResponseDTO<VehicleResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<VehicleResponseDTO>>(
            `/transport/vehicles?page=${page.page}&size=${page.size}`, "GET"
        );
    }

    public async search(q: string, page: PageParams): Promise<PaginationBaseResponseDTO<VehicleResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<VehicleResponseDTO>>(
            `/transport/vehicles/search?q=${encodeURIComponent(q)}&page=${page.page}&size=${page.size}`, "GET"
        );
    }

    public async findById(id: number): Promise<VehicleResponseDTO> {
        return await officeAPI<null, VehicleResponseDTO>(`/transport/vehicles/${id}`, "GET");
    }

    public async findByIdInDetail(id: number): Promise<VehicleDetailResponseDTO> {
        return await officeAPI<null, VehicleDetailResponseDTO>(`/transport/vehicles/details/${id}`, "GET");
    }

    public async create(requestDTO: VehicleCreateRequestDTO): Promise<VehicleResponseDTO> {
        return await officeAPI<VehicleCreateRequestDTO, VehicleResponseDTO>(
            `/transport/vehicles`, "POST", requestDTO
        );
    }

    public async update(id: number, requestDTO: VehicleUpdateRequestDTO): Promise<VehicleResponseDTO> {
        return await officeAPI<VehicleUpdateRequestDTO, VehicleResponseDTO>(
            `/transport/vehicles/${id}`, "PUT", requestDTO
        );
    }

    public async delete(id: number): Promise<void> {
        await officeAPI<null, void>(`/transport/vehicles/${id}`, "DELETE");
    }
}
```

---

## 3. Account Service API (`/api/v1/account/*`)

| Method | Endpoint | Access | Request Body | Response Envelope Payload |
|---|---|---|---|---|
| `POST` | `/account/auth/register` | Public | `AuthRegisterRequestDTO` | `AuthTokenResponseDTO` (Sets `_secure` cookie) |
| `POST` | `/account/auth/login` | Public | `AuthLoginRequestDTO` | `AuthTokenResponseDTO` (Sets `_secure` cookie) |
| `GET` | `/account/auth/verify` | Authenticated | None | `OfficeUserVerifyResponseDTO` |
| `POST` | `/account/auth/logout` | Authenticated | None | `Void` (Clears `_secure` cookie) |

---

## 4. Workforce Service API (`/api/v1/workforce/*`)

### Persons (`/workforce/persons`)
| Method | Endpoint | Access | Query / Body | Response Payload |
|---|---|---|---|---|
| `GET` | `/workforce/persons` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | `page`, `size` | `PaginationBaseResponseDTO<PersonResponseDTO>` |
| `GET` | `/workforce/persons/search` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | `q`, `isActive`, `page`, `size` | `PaginationBaseResponseDTO<PersonResponseDTO>` |
| `GET` | `/workforce/persons/{id}` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | Path `id: Long` | `PersonResponseDTO` |
| `GET` | `/workforce/persons/details/{id}` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | Path `id: Long` | `PersonDetailResponseDTO` (Person + Detail + Staffs) |
| `POST` | `/workforce/persons` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | `PersonCreateRequestDTO` | `PersonResponseDTO` |
| `PUT` | `/workforce/persons/{id}` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | `PersonUpdateRequestDTO` | `PersonResponseDTO` |
| `DELETE`| `/workforce/persons/{id}` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | Path `id: Long` | `Void` (Soft deletes: `isActive=false`) |

### Companies & Departments (`/workforce/companies`, `/workforce/departments`)
| Method | Endpoint | Access | Query / Body | Response Payload |
|---|---|---|---|---|
| `GET` | `/workforce/companies` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | `page`, `size` | `PaginationBaseResponseDTO<CompanyResponseDTO>` |
| `GET` | `/workforce/companies/search` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | `q`, `isActive`, `page`, `size` | `PaginationBaseResponseDTO<CompanyResponseDTO>` |
| `GET` | `/workforce/companies/{id}` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | Path `id: Long` | `CompanyResponseDTO` |
| `GET` | `/workforce/companies/details/{id}` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | Path `id: Long` | `CompanyDetailResponseDTO` |
| `POST` | `/workforce/companies` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | `CompanyCreateRequestDTO` | `CompanyResponseDTO` |
| `PUT` | `/workforce/companies/{id}` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | `CompanyUpdateRequestDTO` | `CompanyResponseDTO` |
| `DELETE`| `/workforce/companies/{id}` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | Path `id: Long` | `Void` |
| `GET` | `/workforce/departments` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | `companyId`, `page`, `size` | `PaginationBaseResponseDTO<DepartmentResponseDTO>` |
| `POST` | `/workforce/departments` | `WORKFORCE_ADMIN`, `OFFICE_ADMIN` | `DepartmentCreateRequestDTO` | `DepartmentResponseDTO` |

---

## 5. Transport Service API (`/api/v1/transport/*`)

### Vehicles Management (`/transport/vehicles`)
| Method | Endpoint | Access | Query / Body | Response Payload |
|---|---|---|---|---|
| `GET` | `/transport/vehicles` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `page`, `size` | `PaginationBaseResponseDTO<VehicleResponseDTO>` |
| `GET` | `/transport/vehicles/search` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `q`, `personUid`, `isActive`, `page`, `size` | `PaginationBaseResponseDTO<VehicleResponseDTO>` |
| `GET` | `/transport/vehicles/{id}` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | Path `id: Long` | `VehicleResponseDTO` |
| `GET` | `/transport/vehicles/details/{id}` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | Path `id: Long` | `VehicleDetailResponseDTO` (Vehicle + Detail + VRD + Owner) |
| `POST` | `/transport/vehicles` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `VehicleCreateRequestDTO` | `VehicleResponseDTO` |
| `PUT` | `/transport/vehicles/{id}` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `VehicleUpdateRequestDTO` | `VehicleResponseDTO` |
| `DELETE`| `/transport/vehicles/{id}` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | Path `id: Long` | `Void` (Soft deletes: `isActive=false`) |
| `PUT` | `/transport/vehicles/{id}/avatar` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `{ "avatarUrl": string }` | `VehicleResponseDTO` |
| `PUT` | `/transport/vehicles/{id}/vrd-expiry`| `TRANSPORT_ADMIN`, `OFFICE_ADMIN`| `{ "vrdExpiryDate": string }`| `VehicleResponseDTO` |

### Vehicle Registration Documents (VRD) (`/transport/vehicles/{id}/vrds`)
| Method | Endpoint | Access | Body | Response Payload |
|---|---|---|---|---|
| `GET` | `/transport/vehicles/{id}/vrds` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | None | `List<VehicleVrdResponseDTO>` |
| `POST` | `/transport/vehicles/{id}/vrds` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `VehicleVrdCreateRequestDTO` | `VehicleVrdResponseDTO` |
| `PUT` | `/transport/vrds/{vrdId}` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `VehicleVrdUpdateRequestDTO` | `VehicleVrdResponseDTO` |

### VRD Upload, OCR & Approval Queue (`/transport/vehicles/{id}/scans`, `/transport/vehicles/{id}/vrd-submissions`)
| Method | Endpoint | Access | Content-Type & Body | Response Payload |
|---|---|---|---|---|
| `POST` | `/transport/vehicles/{id}/scans/hk_vrds` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `multipart/form-data` (`file`) | `VrdSubmissionResponseDTO` |
| `GET` | `/transport/vehicles/{id}/vrd-submissions` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | None | `List<VrdSubmissionResponseDTO>` |
| `GET` | `/transport/vrd-submissions/pending` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `page`, `size` | `PaginationBaseResponseDTO<VrdSubmissionResponseDTO>` |
| `PUT` | `/transport/vehicles/{id}/vrd-submissions/{subId}` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `VrdSubmissionUpdateRequestDTO` | `VrdSubmissionResponseDTO` |
| `POST` | `/transport/vehicles/{id}/vrd-submissions/{subId}/approve` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `{ "scannedData": object }` | `VehicleVrdResponseDTO` |
| `POST` | `/transport/vehicles/{id}/vrd-submissions/{subId}/decline` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `{ "reason": string }` | `VrdSubmissionResponseDTO` |

### Document Explorer (`/transport/vehicles/{id}/explorer`)
*Pure local file system operations rooted at `/data/local/office/transport-service/vehicles/{vehicleUid}/explorer` (no database persistence). Handles missing or renamed files gracefully with warning signals.*

| Method | Endpoint | Access | Body / Params | Response Payload |
|---|---|---|---|---|
| `GET` | `/transport/vehicles/{id}/explorer` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `folder` (optional query param) | `VehicleExplorerResponseDTO` |
| `POST` | `/transport/vehicles/{id}/explorer/folders` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `{ "parentPath": string, "folderName": string }` | `ExplorerItemResponseDTO` |
| `POST` | `/transport/vehicles/{id}/explorer/files` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `multipart/form-data` (`file`, `folderPath`) | `ExplorerItemResponseDTO` |
| `DELETE`| `/transport/vehicles/{id}/explorer/items` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `{ "relativePath": string }` | `Void` |
| `PUT` | `/transport/vehicles/{id}/explorer/move` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `{ "sourcePath": string, "targetPath": string }` | `ExplorerItemResponseDTO` |
| `GET` | `/transport/vehicles/{id}/explorer/content` | `TRANSPORT_ADMIN`, `OFFICE_ADMIN` | `path` (relative file path) | Direct `FileStream` |

#### `ExplorerItemResponseDTO` Schema
```typescript
interface ExplorerItemResponseDTO {
  name: string;
  relativePath: string;
  isFolder: boolean;
  byteSize: number;
  lastModified: string;
  isAccessible: boolean;        // false if file/folder disappeared or was renamed on disk
  warningSignal?: string;      // e.g. "FILE_NOT_FOUND", "FOLDER_RENAMED_OR_MISSING"
  warningMessage?: string;     // User-facing warning for tooltip/badge
}

interface VehicleExplorerResponseDTO {
  vehicleId: number;
  vehicleUid: string;
  currentFolder: string;
  items: ExplorerItemResponseDTO[];
  hasWarnings: boolean;
}
```
