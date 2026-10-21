import type { SocketTransportService } from "../realtime/SocketTransportService";
import type { MeshFragmentDTO } from "../../models/dto/mesh.dto";
import { unwrapPage } from "../../models/dto/base.dto";
export interface MeshCacheRecord {
    key: string;
    meshId: string;
    versionId: string;
    byteLength: number;
    sha256: string;
    savedAt: number;
}
export interface MeshCacheStore {
    metadata(key: string): Promise<MeshCacheRecord | undefined>;
    blob(key: string): Promise<Blob | undefined>;
    put(record: MeshCacheRecord, blob: Blob): Promise<void>;
    remove(key: string): Promise<void>;
}
export class MemoryMeshCacheStore implements MeshCacheStore {
    public records = new Map<string, MeshCacheRecord>();
    public blobs = new Map<string, Blob>();
    async metadata(key: string) {
        return this.records.get(key);
    }
    async blob(key: string) {
        return this.blobs.get(key);
    }
    async put(record: MeshCacheRecord, blob: Blob) {
        this.blobs.set(record.key, blob);
        this.records.set(record.key, record);
        let size = [...this.blobs.values()].reduce((sum, value) => sum + value.size, 0);
        while (this.blobs.size > 64 || size > 128 * 1024 * 1024) {
            const oldest = this.blobs.keys().next().value!;
            size -= this.blobs.get(oldest)!.size;
            await this.remove(oldest);
        }
    }
    async remove(key: string) {
        this.blobs.delete(key);
        this.records.delete(key);
    }
}
interface StorageBucketManager {
    open(name: string): Promise<{ caches: CacheStorage }>;
}
export class BrowserMeshCacheStore implements MeshCacheStore {
    private database?: Promise<IDBDatabase>;
    private files?: Promise<Cache>;
    private memory = new MemoryMeshCacheStore();
    public persistent = true;
    private db() {
        return (this.database ??= new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open("mesh-district-index-v2", 1);
            request.onupgradeneeded = () => request.result.createObjectStore("meshes", { keyPath: "key" });
            request.onsuccess = () => {
                request.result.onversionchange = () => request.result.close();
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
            request.onblocked = () => reject(new Error("Mesh cache database is blocked by another tab."));
        }));
    }
    private cache() {
        return (this.files ??= (async () => {
            const manager = (navigator as Navigator & { storageBuckets?: StorageBucketManager }).storageBuckets;
            if (manager) {
                try {
                    return await (await manager.open("mesh-assets")).caches.open("mesh-files-v2");
                } catch {
                    /* Fall back to the origin's default storage bucket. */
                }
            }
            return caches.open("mesh-files-v2");
        })());
    }
    private url(key: string) {
        return new URL(`/__mesh_cache/${encodeURIComponent(key)}`, location.origin).href;
    }
    private async request<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
        const db = await this.db();
        return new Promise((resolve, reject) => {
            const tx = db.transaction("meshes", mode),
                request = run(tx.objectStore("meshes"));
            tx.oncomplete = () => resolve(request.result);
            tx.onerror = () => reject(tx.error || request.error);
            tx.onabort = () => reject(tx.error || new Error("Cache write aborted."));
        });
    }
    public async metadata(key: string) {
        try {
            return (
                (await this.request<MeshCacheRecord | undefined>("readonly", (store) => store.get(key))) ||
                (await this.memory.metadata(key))
            );
        } catch {
            this.persistent = false;
            return this.memory.metadata(key);
        }
    }
    public async blob(key: string) {
        try {
            return (await (await (await this.cache()).match(this.url(key)))?.blob()) || (await this.memory.blob(key));
        } catch {
            this.persistent = false;
            return this.memory.blob(key);
        }
    }
    public async put(record: MeshCacheRecord, blob: Blob) {
        // The completion record is committed only after a verified file exists.
        await this.memory.put(record, blob);
        try {
            await (
                await this.cache()
            ).put(this.url(record.key), new Response(blob, { headers: { "Content-Type": "model/gltf-binary" } }));
            await this.request("readwrite", (store) => store.put(record));
        } catch {
            this.persistent = false;
        }
    }
    public async remove(key: string) {
        await this.memory.remove(key);
        await Promise.allSettled([
            (async () => (await this.cache()).delete(this.url(key)))(),
            this.request("readwrite", (store) => store.delete(key)),
        ]);
    }
}
async function digest(bytes: Uint8Array) {
    return [...new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(bytes).buffer))]
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");
}
function isGLB(bytes: Uint8Array) {
    if (bytes.length < 12) return false;
    const header = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return (
        header.getUint32(0, true) === 0x46546c67 &&
        header.getUint32(4, true) === 2 &&
        header.getUint32(8, true) === bytes.length
    );
}
export default class MeshCacheService {
    private inflight = new Map<string, Promise<Blob>>();
    private urls = new Map<string, string>();
    private active = 0;
    private waiting: (() => void)[] = [];
    private async scheduled<T>(run: () => Promise<T>): Promise<T> {
        if (this.active >= 3) await new Promise<void>((resolve) => this.waiting.push(resolve));
        else this.active++;
        try {
            return await run();
        } finally {
            const next = this.waiting.shift();
            if (next) next();
            else this.active--;
        }
    }
    public hits = 0;
    public downloads = 0;
    public constructor(
        private readonly socket: SocketTransportService,
        public readonly store: MeshCacheStore = new BrowserMeshCacheStore(),
    ) {}
    public async get(meshId: string, versionId: string): Promise<Blob> {
        if (!meshId || !versionId) throw new Error("A mesh ID and immutable version ID are required.");
        const key = `${meshId}@${versionId}`;
        const existing = this.inflight.get(key);
        if (existing) return existing;
        const pending = this.scheduled(() => this.load(meshId, versionId, key));
        this.inflight.set(key, pending);
        try {
            return await pending;
        } finally {
            this.inflight.delete(key);
        }
    }
    private async load(meshId: string, versionId: string, key: string) {
        const record = await this.store.metadata(key),
            cached = await this.store.blob(key);
        if (
            record?.versionId === versionId &&
            record.meshId === meshId &&
            cached &&
            cached.size === record.byteLength
        ) {
            const bytes = new Uint8Array(await cached.arrayBuffer());
            if (isGLB(bytes) && (await digest(bytes)) === record.sha256) {
                this.hits++;
                return cached;
            }
        }
        await this.store.remove(key);
        let page = 0,
            totalPages = 1,
            nextIndex = 0,
            offset = 0;
        let descriptor: MeshFragmentDTO | undefined, bytes: Uint8Array | undefined;
        while (page < totalPages) {
            // Three 12 KiB fragments keep a Base64 reply below a typical 64 KiB STOMP limit.
            const reply = unwrapPage(
                await this.socket.request<MeshFragmentDTO>("/app/mesh/fragments", { meshId, versionId, page, size: 3 }),
            );
            if (reply.pageNumber !== page || !reply.content.length || reply.totalPages > 2000)
                throw new Error("Invalid mesh fragment page.");
            if (page && reply.totalPages !== totalPages) throw new Error("Mesh transfer changed during download.");
            totalPages = reply.totalPages;
            for (const fragment of reply.content) {
                if (!descriptor) {
                    descriptor = fragment;
                    if (
                        !Number.isInteger(fragment.byteLength) ||
                        fragment.byteLength < 12 ||
                        fragment.byteLength > 64 * 1024 * 1024 ||
                        fragment.fragmentCount !== reply.totalElements
                    )
                        throw new Error("Invalid mesh transfer size.");
                    bytes = new Uint8Array(fragment.byteLength);
                }
                if (
                    fragment.meshId !== meshId ||
                    fragment.versionId !== versionId ||
                    fragment.index !== nextIndex++ ||
                    fragment.sha256 !== descriptor.sha256 ||
                    fragment.byteLength !== descriptor.byteLength ||
                    fragment.fragmentCount !== descriptor.fragmentCount ||
                    fragment.base64.length > 17000
                )
                    throw new Error("Mesh fragments do not match the requested version.");
                const decoded = Uint8Array.from(atob(fragment.base64), (character) => character.charCodeAt(0));
                if (offset + decoded.length > bytes!.length) throw new Error("Mesh fragment exceeds declared size.");
                bytes!.set(decoded, offset);
                offset += decoded.length;
            }
            page++;
        }
        if (
            !bytes ||
            !descriptor ||
            offset !== bytes.length ||
            nextIndex !== descriptor.fragmentCount ||
            !isGLB(bytes) ||
            (await digest(bytes)) !== descriptor.sha256
        )
            throw new Error("Mesh download failed its integrity check. Retry the view.");
        const blob = new Blob([new Uint8Array(bytes).buffer], { type: "model/gltf-binary" });
        await this.store.put(
            { key, meshId, versionId, byteLength: bytes.length, sha256: descriptor.sha256, savedAt: Date.now() },
            blob,
        );
        this.downloads++;
        return blob;
    }
    public async objectUrl(meshId: string, versionId: string) {
        const key = `${meshId}@${versionId}`;
        if (this.urls.has(key)) return this.urls.get(key)!;
        const blob = await this.get(meshId, versionId);
        if (this.urls.has(key)) return this.urls.get(key)!;
        const url = URL.createObjectURL(blob);
        this.urls.set(key, url);
        if (this.urls.size > 64) {
            const first = this.urls.keys().next().value!;
            URL.revokeObjectURL(this.urls.get(first)!);
            this.urls.delete(first);
        }
        return url;
    }
    public dispose() {
        for (const url of this.urls.values()) URL.revokeObjectURL(url);
        this.urls.clear();
    }
}
