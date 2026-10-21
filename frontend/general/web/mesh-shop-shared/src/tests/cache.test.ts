import { describe, expect, it, vi } from "vitest";
import "fake-indexeddb/auto";
import MeshCacheService, { BrowserMeshCacheStore, MemoryMeshCacheStore } from "../services/storage/MeshCacheService";
import MockSocketTransportService, { FRAGMENT_BYTES } from "../services/realtime/MockSocketTransportService";
import MockRepositoryService, { MemoryStateStore } from "../services/storage/MockRepositoryService";
import type { SocketTransportService } from "../services/realtime/SocketTransportService";

function glb(length = FRAGMENT_BYTES * 25 + 4) {
    const bytes = new Uint8Array(length),
        header = new DataView(bytes.buffer);
    header.setUint32(0, 0x46546c67, true);
    header.setUint32(4, 2, true);
    header.setUint32(8, length, true);
    return new Blob([bytes], { type: "model/gltf-binary" });
}
function fixture() {
    const repository = new MockRepositoryService(new MemoryStateStore());
    const socket = new MockSocketTransportService(repository, async () => glb());
    const request = vi.spyOn(socket, "request");
    const store = new MemoryMeshCacheStore();
    return { repository, socket, request, store, cache: new MeshCacheService(socket, store) };
}
describe("versioned browser mesh cache", () => {
    it("assembles more than twenty fragments through repeated bounded pages and reuses matching files", async () => {
        const { cache, request, store } = fixture();
        const first = await cache.get("1", "1-v1");
        expect(first.size).toBe(glb().size);
        expect(request).toHaveBeenCalledTimes(9);
        expect(request.mock.calls.every(([, payload]) => payload.size === 3)).toBe(true);
        expect(store.records.size).toBe(1);
        expect(await cache.get("1", "1-v1")).toBe(first);
        expect(request).toHaveBeenCalledTimes(9);
        expect(cache.hits).toBe(1);
    });
    it("deduplicates simultaneous requests for the same immutable version", async () => {
        const { cache, request } = fixture();
        const [a, b] = await Promise.all([cache.get("1", "1-v1"), cache.get("1", "1-v1")]);
        expect(a).toBe(b);
        expect(request).toHaveBeenCalledTimes(9);
    });
    it("downloads a new version and retains the old pinned version", async () => {
        const { cache, repository, request } = fixture();
        await cache.get("1", "1-v1");
        await repository.update((state) => {
            state.meshVersions!["1@1-v2"] = { ...state.meshVersions!["1@1-v1"], version: 2, versionId: "1-v2" };
        });
        await cache.get("1", "1-v2");
        await cache.get("1", "1-v1");
        expect(request).toHaveBeenCalledTimes(18);
        expect(cache.downloads).toBe(2);
    });
    it.each(["missing", "corrupt"])(
        "refetches when the cached blob is %s even if IndexedDB metadata exists",
        async (condition) => {
            const { cache, store } = fixture();
            await cache.get("1", "1-v1");
            if (condition === "missing") store.blobs.delete("1@1-v1");
            else store.blobs.set("1@1-v1", new Blob([new Uint8Array(glb().size)]));
            await cache.get("1", "1-v1");
            expect(cache.downloads).toBe(2);
        },
    );
    it.each(["order", "checksum", "version", "disconnect"])("never marks a %s failure as cached", async (failure) => {
        const { socket, store } = fixture();
        const tampered: SocketTransportService = {
            async request(destination, payload, signal) {
                if (failure === "disconnect" && payload.page === 1) throw new Error("Connection lost");
                const reply = await socket.request<any>(destination, payload, signal);
                if (reply.success)
                    for (const value of reply.data.content) {
                        if (failure === "order") value.index++;
                        if (failure === "checksum") value.sha256 = "0".repeat(64);
                        if (failure === "version") value.versionId = "wrong";
                    }
                return reply;
            },
        };
        const cache = new MeshCacheService(tampered, store);
        await expect(cache.get("1", "1-v1")).rejects.toThrow();
        expect(store.records.size).toBe(0);
        expect(store.blobs.size).toBe(0);
    });
    it("persists verified metadata in IndexedDB and files in the browser cache across store instances", async () => {
        const files = new Map<string, Response>();
        const cache = {
            match: async (key: string) => files.get(key)?.clone(),
            put: async (key: string, value: Response) => {
                files.set(key, value.clone());
            },
            delete: async (key: string) => files.delete(key),
        };
        const open = vi.fn(async () => cache);
        vi.stubGlobal("location", { origin: "https://mesh.test" });
        vi.stubGlobal("navigator", { storageBuckets: { open: async () => ({ caches: { open } }) } });
        try {
            const store = new BrowserMeshCacheStore(),
                blob = glb(128),
                record = {
                    key: "987@v1",
                    meshId: "987",
                    versionId: "v1",
                    byteLength: 128,
                    sha256: "test",
                    savedAt: Date.now(),
                };
            await store.put(record, blob);
            const next = new BrowserMeshCacheStore();
            expect(await next.metadata(record.key)).toEqual(record);
            expect((await next.blob(record.key))?.size).toBe(128);
            expect(open).toHaveBeenCalledWith("mesh-files-v2");
            await next.remove(record.key);
            expect(await next.metadata(record.key)).toBeUndefined();
            expect(await next.blob(record.key)).toBeUndefined();
        } finally {
            vi.unstubAllGlobals();
        }
    });
});
