import type { MeshResponseDTO, MockStateDTO, ObjectType, SceneObjectDTO } from "../models/dto/mesh.dto";
export const TEMPLATE_MESH_IDS: Partial<Record<ObjectType, string>> = {
    CHAIR: "1",
    LAMP: "2",
    TABLE: "3",
    BUILDING: "4",
    PLANT: "5",
    BOX: "6",
    SPHERE: "7",
    DOOR: "8",
};
export function stripInteraction(object: SceneObjectDTO): SceneObjectDTO {
    const { interaction, productId, target, ...source } = object;
    return source;
}
export function migrateState(state: MockStateDTO): MockStateDTO {
    if (state.schemaVersion === 2) return state;
    const used = new Set(state.meshes.filter((m) => /^\d+$/.test(m.id)).map((m) => m.id));
    let next = Math.max(8, ...[...used].map(Number)) + 1;
    const ids = new Map<string, string>();
    for (const mesh of state.meshes) {
        const seed = ({ "arc-chair": "1", "orbit-light": "2", "pebble-table": "3" } as Record<string, string>)[mesh.id];
        ids.set(mesh.id, /^\d+$/.test(mesh.id) ? mesh.id : seed || String(next++));
    }
    state.meshes = state.meshes.map((mesh) => ({
        ...mesh,
        id: ids.get(mesh.id)!,
        objects: mesh.objects.map(stripInteraction),
        versionId: `${ids.get(mesh.id)}-v${mesh.version}`,
    }));
    for (const [type, id] of Object.entries(TEMPLATE_MESH_IDS)) {
        if (state.meshes.some((mesh) => mesh.id === id)) continue;
        const source: SceneObjectDTO = {
            id: `template-${id}`,
            type: type as ObjectType,
            name: `${type.toLowerCase()} template`,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: "#a8b18c",
            visible: true,
        };
        state.meshes.push({
            id,
            version: 1,
            versionId: `${id}-v1`,
            name: source.name,
            description: "Reusable district geometry.",
            category: type === "BUILDING" || type === "DOOR" ? "Architecture" : "Decoration",
            status: "PUBLISHED",
            objects: [source],
            updatedAt: new Date().toISOString(),
        });
    }
    const sceneIds = new Map<string, string>();
    for (const type of ["maps", "spots", "places"]) {
        let nextId =
            Math.max(0, ...state.scenes.filter((s) => s.type === type && /^\d+$/.test(s.id)).map((s) => Number(s.id))) +
            1;
        for (const scene of state.scenes.filter((s) => s.type === type))
            sceneIds.set(`${type}/${scene.id}`, /^\d+$/.test(scene.id) ? scene.id : String(nextId++));
    }
    const convert = (object: SceneObjectDTO): SceneObjectDTO => {
        let assetId = object.assetId ? ids.get(object.assetId) || object.assetId : TEMPLATE_MESH_IDS[object.type];
        if (!assetId && object.type === "OBJ" && object.objSource) {
            assetId = String(next++);
            const source = {
                ...stripInteraction(object),
                position: [0, 0, 0] as [number, number, number],
                rotation: [0, 0, 0] as [number, number, number],
                scale: [1, 1, 1] as [number, number, number],
            };
            state.meshes.push({
                id: assetId,
                version: 1,
                versionId: `${assetId}-v1`,
                name: object.name,
                description: "Migrated scene geometry",
                category: "Other",
                status: "PUBLISHED",
                objects: [source],
                updatedAt: new Date().toISOString(),
            });
        }
        const asset = state.meshes.find((mesh) => mesh.id === assetId);
        const interaction =
            object.interaction ||
            (object.productId
                ? { type: "PRODUCT" as const, productId: object.productId }
                : object.target
                  ? {
                        type: "TELEPORT" as const,
                        destination: {
                            ...object.target,
                            id: sceneIds.get(`${object.target.type}/${object.target.id}`) || object.target.id,
                            position: [0, 0, 4] as [number, number, number],
                            yaw: 0,
                        },
                    }
                  : undefined);
        const { productId, target, ...rest } = object;
        return {
            ...rest,
            type: object.type === "OBJ" && asset ? "ASSET" : object.type,
            objSource: asset ? undefined : rest.objSource,
            assetId,
            assetVersionId: asset?.versionId,
            interaction,
        };
    };
    const scene = (item: (typeof state.scenes)[number]) => ({
        ...item,
        id: sceneIds.get(`${item.type}/${item.id}`) || item.id,
        parent: item.parent
            ? { ...item.parent, id: sceneIds.get(`${item.parent.type}/${item.parent.id}`) || item.parent.id }
            : undefined,
        objects: item.objects.map(convert),
    });
    state.scenes = state.scenes.map(scene);
    state.drafts = Object.fromEntries(
        Object.values(state.drafts).map((item) => {
            const value = scene(item);
            return [`${value.type}/${value.id}`, value];
        }),
    );
    state.meshVersions = Object.fromEntries(
        state.meshes.map((mesh) => [`${mesh.id}@${mesh.versionId}`, structuredClone(mesh)]),
    );
    state.transactions = {};
    state.schemaVersion = 2;
    return state;
}
export function meshSummary(mesh: MeshResponseDTO): MeshResponseDTO {
    const { glbUrl, ...metadata } = mesh;
    return {
        ...metadata,
        objectCount: mesh.objects.length,
        previewType: mesh.objects[0]?.type,
        previewColor: mesh.objects[0]?.color,
        objects: [],
    };
}
