import axios from "axios";
import type { MockStateDTO } from "../../models/dto/mesh.dto";
import { unwrapResponse } from "../../models/dto/base.dto";
import { migrateState } from "../../mock/migrate";
import { createInitialState } from "../../mock/world";

export interface MockStateStore {
    read(): Promise<MockStateDTO>;
    write(state: MockStateDTO): Promise<void>;
}
export class MemoryStateStore implements MockStateStore {
    public constructor(private state = createInitialState()) {}
    public async read() {
        return structuredClone(this.state);
    }
    public async write(state: MockStateDTO) {
        this.state = structuredClone(state);
    }
}
export class BrowserStateStore implements MockStateStore {
    private readonly key = "mesh-district:demo:v1";
    public async read(): Promise<MockStateDTO> {
        if (import.meta.env.DEV) return unwrapResponse((await axios.get("/__mesh_mock/state")).data);
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : createInitialState();
    }
    public async write(state: MockStateDTO): Promise<void> {
        if (import.meta.env.DEV) {
            unwrapResponse((await axios.put("/__mesh_mock/state", state)).data);
            return;
        }
        try {
            localStorage.setItem(this.key, JSON.stringify(state));
        } catch {
            throw new Error("Local demo storage is full. Use smaller assets or run the development server.");
        }
    }
}
export default class MockRepositoryService {
    private static INSTANCE: MockRepositoryService;
    public constructor(private readonly store: MockStateStore = new BrowserStateStore()) {}
    public static getInstance(): MockRepositoryService {
        return (this.INSTANCE ??= new MockRepositoryService());
    }
    public async read() {
        return migrateState(await this.store.read());
    }
    public async update<T>(operation: (state: MockStateDTO) => T): Promise<T> {
        const state = await this.read();
        const result = operation(state);
        await this.store.write(state);
        return structuredClone(result);
    }
}
