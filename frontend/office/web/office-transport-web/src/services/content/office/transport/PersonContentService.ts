import officeAPI from "@/api/office.api";
import { PersonSummaryDTO } from "@/models/dto/office/transport/object.dto";

export default class PersonContentService {
    private static INSTANCE: PersonContentService;

    private constructor() {}

    public static getInstance(): PersonContentService {
        if (!PersonContentService.INSTANCE) {
            PersonContentService.INSTANCE = new PersonContentService();
        }
        return PersonContentService.INSTANCE;
    }

    public async searchPersons(q: string = ""): Promise<PersonSummaryDTO[]> {
        const queryParam = q ? `?q=${encodeURIComponent(q)}` : "";
        try {
            const res = await officeAPI<null, any>(`/transport/persons/search${queryParam}`, "GET");
            if (Array.isArray(res)) return res;
            if (res && Array.isArray(res.content)) return res.content;
            return [];
        } catch (err) {
            console.warn("Failed to search persons via /transport/persons/search, trying /workforce/persons/search fallback:", err);
            try {
                const fallback = await officeAPI<null, any>(`/workforce/persons/search${queryParam}`, "GET");
                if (Array.isArray(fallback)) return fallback;
                if (fallback && Array.isArray(fallback.content)) return fallback.content;
            } catch (fallbackErr) {
                console.warn("Workforce persons search fallback also failed:", fallbackErr);
            }
            return [];
        }
    }

    public async findByUid(uid: string): Promise<PersonSummaryDTO> {
        try {
            return await officeAPI<null, PersonSummaryDTO>(`/transport/persons/${uid}`, "GET");
        } catch {
            return await officeAPI<null, PersonSummaryDTO>(`/workforce/persons/${uid}`, "GET");
        }
    }
}
