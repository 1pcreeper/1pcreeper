import { describe, expect, it } from "vitest";
import MockSocketTransportService from "../services/realtime/MockSocketTransportService";
import { withinChunks } from "../services/content/ChunkService";
import MockTransportService from "../services/base/MockTransportService";
import MockRepositoryService, { MemoryStateStore } from "../services/storage/MockRepositoryService";
import GameContentService from "../services/content/GameContentService";
import MeshContentService from "../services/content/MeshContentService";
import { createObject } from "../mock/world";
import { geoCoordinates } from "../services/content/GeoCoordinateService";
import WorkspaceService from "../services/content/WorkspaceService";

function fixture() {
    const repository = new MockRepositoryService(new MemoryStateStore());
    const transport = new MockTransportService(repository);
    return {
        repository,
        transport,
        game: new GameContentService(transport, new MockSocketTransportService(repository)),
        mesh: new MeshContentService(transport),
    };
}
describe("scene publication", () => {
    it("keeps edits private until publication, increments the version, and rejects stale writes", async () => {
        const { game } = fixture();
        const original = await game.findById("spots", "13");
        const draft = await game.saveDraft({
            ...original,
            name: "Edited room",
            objects: [...original.objects, createObject("BOX", "New object")],
        });
        expect((await game.findById("spots", "13")).name).toBe(original.name);
        expect((await game.findById("spots", "13", true)).objectCount).toBe(original.objectCount! + 1);
        const published = await game.publish(draft);
        expect(published.version).toBe(2);
        expect(published.status).toBe("PUBLISHED");
        expect((await game.findById("spots", "13")).name).toBe("Edited room");
        await expect(game.saveDraft(original)).rejects.toThrow("newer version");
    });
    it("discards a saved draft without altering production", async () => {
        const { game } = fixture();
        const original = await game.findById("spots", "13");
        await game.saveDraft({ ...original, name: "Discard this" });
        await game.discardDraft(original);
        expect(await game.findById("spots", "13", true)).toEqual(original);
    });
    it("returns an error envelope for missing resources instead of a fabricated scene", async () => {
        const { transport } = fixture();
        expect(await transport.request("/game/spots/missing")).toMatchObject({ success: false, data: null });
    });
    it("does not expose newly created drafts to public visitors", async () => {
        const { game } = fixture();
        const source = await game.findById("spots", "13");
        const created = await game.create({ ...source, name: "New merchant space", merchantId: "form-field" });
        expect(created.status).toBe("DRAFT");
        await expect(game.findById("spots", created.id)).rejects.toThrow("not be found");
        expect((await game.findById("spots", created.id, true)).name).toBe("New merchant space");
    });
    it("requires an approved merchant for new spaces", async () => {
        const { game } = fixture();
        const source = await game.findById("spots", "13");
        await expect(game.create({ ...source, merchantId: "still-studio" })).rejects.toThrow("approved merchant");
        await game.approveMerchant("still-studio");
        expect((await game.create({ ...source, merchantId: "still-studio" })).merchantId).toBe("still-studio");
    });
    it.each(["maps", "spots", "places"] as const)(
        "streams all nearby %s pages with at most twenty objects",
        async (type) => {
            const { game, repository } = fixture();
            const scene = (await repository.read()).scenes.find((s) => s.type === type)!;
            await repository.update((state) => {
                state.scenes.find((s) => s.uid === scene.uid)!.objects = [
                    ...Array.from({ length: 47 }, (_, i) => createObject("BOX", `Nearby ${i}`, [i % 10, 0, 0])),
                    createObject("BOX", "Distant", [500, 0, 500]),
                ];
            });
            const query = { type, id: scene.id, x: 0, z: 0, snapshotVersion: scene.version };
            const page = await game.findChunk(query, { size: 999 });
            expect(page.content).toHaveLength(20);
            expect(page.totalPages).toBe(3);
            const nearby = await game.loadNearby(query);
            expect(nearby).toHaveLength(47);
            expect(nearby.every((o) => withinChunks(o, query))).toBe(true);
            const far = await game.loadNearby({ ...query, x: 20, z: 20 });
            expect(far.map((o) => o.name)).toEqual(["Distant"]);
            const controller = new AbortController();
            controller.abort();
            await expect(game.loadNearby(query, controller.signal)).rejects.toThrow();
        },
    );
    it("applies paged edits without deleting objects that were never loaded", async () => {
        const { game, repository } = fixture();
        const original = await game.findById("spots", "13");
        const before = (await repository.read()).scenes.find((s) => s.type === "spots" && s.id === "13")!.objects;
        const changes = Array.from({ length: 43 }, (_, i) => createObject("BOX", `Added ${i}`));
        const draft = await game.saveDraft({ ...original, objects: changes }, [before[0]]);
        expect(draft.objects).toHaveLength(43);
        const stored = (await repository.read()).drafts["spots/13"];
        expect(stored.objects).toHaveLength(before.length - 1 + 43);
        expect(stored.objects.some((o) => o.id === before[0].id)).toBe(false);
        expect(stored.objects.some((o) => o.id === before[1].id)).toBe(true);
        await expect(game.saveDraft(original)).rejects.toThrow("draft changed");
        await expect(
            game.loadNearby({ type: "spots", id: "13", x: 0, z: 0, draft: true, snapshotVersion: original.version }),
        ).rejects.toThrow("draft changed");
        expect((await game.publish(draft)).objectCount).toBe(stored.objects.length);
    });
    it("searches and paginates metadata without embedding all scene objects", async () => {
        const { game, mesh } = fixture();
        const scenes = await game.findPage({ size: 2 });
        expect(scenes.content).toHaveLength(2);
        expect(scenes.content.every((s) => !s.objects.length)).toBe(true);
        const assets = await mesh.findPage({ size: 2, search: "chair" });
        expect(assets.content.every((m) => m.name.toLowerCase().includes("chair"))).toBe(true);
        expect(assets.content.every((m) => /^\d+$/.test(m.id) && !m.objects.length && !m.glbUrl)).toBe(true);
        const products = await game.findProducts({ size: 1, search: "Orbit" });
        expect(products.content[0].name).toContain("Orbit");
        expect(products.totalElements).toBe(1);
    });
});
describe("mesh assets and change review", () => {
    it("commits reusable geometry and enforces version conflicts", async () => {
        const { mesh } = fixture();
        const asset = await mesh.findById("1");
        const result = await mesh.commit({
            ...asset,
            name: "New material",
            glbUrl: "data:model/gltf-binary;base64,Z2xURg==",
        });
        expect(result.version).toBe(2);
        expect((await mesh.findById("1")).name).toBe("New material");
        await expect(mesh.commit(asset)).rejects.toThrow("updated elsewhere");
    });
    it("retains independent transforms for repeated mesh instances", async () => {
        const { game, repository } = fixture();
        const scene = await game.findById("spots", "13");
        const first = { ...createObject("ASSET", "First chair"), assetId: "1" };
        const second = { ...createObject("ASSET", "Second chair", [4, 0, 0]), assetId: "1" };
        await game.saveDraft({ ...scene, objects: [first, second] });
        const draft = (await repository.read()).drafts["spots/13"];
        const added = draft.objects.filter((o) => o.id === first.id || o.id === second.id);
        expect(added[0].position).toEqual([0, 0, 0]);
        expect(added[1].position).toEqual([4, 0, 0]);
        expect(added[0].id).not.toBe(added[1].id);
    });
    it("keeps behavior on placed objects, never on reusable mesh sources", async () => {
        const { mesh, repository } = fixture();
        const asset = await mesh.findById("1");
        const saved = await mesh.commit({
            ...asset,
            objects: asset.objects.map((o) => ({ ...o, interaction: { type: "PRODUCT", productId: "1234" } })),
        });
        expect(saved.objects.every((o) => !o.interaction)).toBe(true);
        const state = await repository.read();
        expect(state.meshVersions!["1@1-v1"]).toBeDefined();
        expect(state.meshVersions!["1@1-v2"]).toBeDefined();
        expect(saved.versionId).toBe("1-v2");
    });
    it("reports additions, material edits, and removals separately", () => {
        const service = WorkspaceService.getInstance();
        const before = [createObject("BOX", "Keep"), createObject("BOX", "Remove")];
        const after = [{ ...before[0], color: "#ff0000" }, createObject("SPHERE", "Add")];
        expect(service.diff(before, after).map((change) => change.change)).toEqual(["Modified", "Added", "Removed"]);
        expect(service.diff(before, after)[0].detail).toBe("color");
    });
    it("rejects invalid imports and preserves named multi-object OBJ content", async () => {
        const service = WorkspaceService.getInstance();
        await expect(service.importObject(new File(["garbage"], "empty.obj"))).rejects.toThrow("valid OBJ");
        const model = await service.importObject(
            new File(["o triangle\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3"], "triangle.obj"),
        );
        expect(model.type).toBe("OBJ");
        expect(model.objSource).toContain("o triangle");
        await expect(service.importObject(new File(["v 0 0 0"], "unsafe.exe"))).rejects.toThrow(".obj file");
    });
});

describe("local geographic placement", () => {
    it("keeps coordinate edits and gizmo movement consistent without changing height", () => {
        const origin = { longitude: 114.1694, latitude: 22.3193 };
        const building = createObject("BUILDING", "Merchant", [12, 3, -24]);
        const moved = geoCoordinates.applyPatch(building, { position: [24, 3, 12] }, origin);
        expect(moved.longitude).toBeGreaterThan(origin.longitude);
        expect(moved.latitude).toBeGreaterThan(origin.latitude);
        const edited = geoCoordinates.applyPatch(moved, { longitude: origin.longitude }, origin);
        expect(edited.position[0]).toBeCloseTo(0, 6);
        expect(edited.position[1]).toBe(3);
        expect(edited.position[2]).toBeCloseTo(12, 6);
        const roundtrip = geoCoordinates.toPosition(geoCoordinates.toCoordinates(building.position, origin), origin, 3);
        roundtrip.forEach((value, index) => expect(value).toBeCloseTo(building.position[index], 6));
    });
});

describe("first-person jump", () => {
    it("rises on Space, rejects an airborne second jump, and returns to the ground", async () => {
        const { advanceJump } = await import("../services/content/MovementService");
        const state = { velocity: 0, jump: true };
        let height = advanceJump(state, 1.65, 1.65, 1 / 60);
        expect(height).toBeGreaterThan(1.65);
        const velocity = state.velocity;
        state.jump = true;
        height = advanceJump(state, height, 1.65, 1 / 60);
        expect(state.velocity).toBeLessThan(velocity);
        for (let frame = 0; frame < 120; frame++) height = advanceJump(state, height, 1.65, 1 / 60);
        expect(height).toBe(1.65);
        expect(state.velocity).toBe(0);
    });
});
