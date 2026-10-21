import type { MockStateDTO, ObjectType, SceneObjectDTO, SceneResponseDTO, Vector3DTO } from "../models/dto/mesh.dto";
import { geoCoordinates } from "../services/content/GeoCoordinateService";
import { migrateState } from "./migrate";
import { merchants } from "./catalog";

export function createObject(
    type: ObjectType,
    name: string,
    position: Vector3DTO = [0, 0, 0],
    color = "#d8be88",
): SceneObjectDTO {
    return {
        id: crypto.randomUUID(),
        type,
        name,
        position,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color,
        visible: true,
    };
}
const object = (
    id: string,
    type: ObjectType,
    name: string,
    position: Vector3DTO,
    color: string,
    extra: Partial<SceneObjectDTO> = {},
): SceneObjectDTO => ({
    id,
    type,
    name,
    position,
    color,
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true,
    ...extra,
});
const roomObjects: SceneObjectDTO[] = [
    object("ground", "GROUND", "Warm concrete floor", [0, -0.13, 0], "#c4bdb0", { scale: [12, 0.2, 10] }),
    object("back-wall", "BARRIER", "Gallery wall", [0, 1.7, -5], "#d5cfc0", { scale: [12, 3.6, 0.18] }),
    object("side-wall", "BARRIER", "Side wall", [-6, 1.7, 0], "#d5cfc0", { scale: [0.18, 3.6, 10] }),
    object("chair-1", "CHAIR", "Arc lounge chair", [-2.1, 0, 0.1], "#d8be88", {
        productId: "1234",
        rotation: [0, 0.25, 0],
    }),
    object("chair-2", "CHAIR", "Moss lounge chair", [2.2, 0, -0.8], "#728666", {
        productId: "1237",
        rotation: [0, -0.5, 0],
    }),
    object("table-1", "TABLE", "Pebble coffee table", [0.2, 0, 1.3], "#aa7751", { productId: "1236" }),
    object("lamp-1", "LAMP", "Orbit table light", [-3.8, 0, -2.8], "#d87543", {
        productId: "1235",
        scale: [1.5, 1.5, 1.5],
    }),
    object("plant-1", "PLANT", "Ficus / decoration", [4.5, 0, -3.4], "#64734a", { scale: [1.3, 1.3, 1.3] }),
    object("art-1", "BOX", "Colour study 01", [-2.3, 2.1, -4.85], "#bd744e", { scale: [1.5, 1.7, 0.08] }),
    object("art-2", "BOX", "Colour study 02", [-0.45, 2.1, -4.85], "#8d9875", { scale: [1.5, 1.7, 0.08] }),
    object("door-1", "DOOR", "The reading room", [2.3, 0, -4.7], "#647466", { target: { type: "places", id: "1" } }),
    object("light-1", "LIGHT", "Warm gallery light", [0, 3.7, 1], "#ffebc7", { intensity: 18 }),
];
const scene = (
    id: string,
    type: SceneResponseDTO["type"],
    name: string,
    objects: SceneObjectDTO[],
    extra: Partial<SceneResponseDTO> = {},
): SceneResponseDTO => ({
    id,
    uid: `mock-${type}-${id}`,
    type,
    name,
    description: "Thoughtful objects. New perspectives.",
    version: 1,
    status: "PUBLISHED",
    updatedAt: "2026-09-28T09:00:00.000Z",
    longitude: 114.1694,
    latitude: 22.3193,
    objects,
    ...extra,
});
export function createInitialState(): MockStateDTO {
    const buildings = Array.from({ length: 25 }, (_, i) => {
        const x = ((i % 5) - 2) * 12;
        const z = (Math.floor(i / 5) - 2) * 12;
        return object(
            `building-${i}`,
            "BUILDING",
            i === 12
                ? "Form & Field"
                : i === 13
                  ? "Common Objects"
                  : ["Atelier North", "Sunday Supply", "Made Slowly", "Studio Terra"][i % 4],
            [x, 0, z],
            ["#ccab84", "#829780", "#c48567", "#b7b6a5", "#929aa7"][i % 5],
            {
                target: { type: "spots", id: String(i + 1) },
                ...geoCoordinates.toCoordinates([x, 0, z], { longitude: 114.1694, latitude: 22.3193 }),
            },
        );
    });
    return migrateState({
        revision: 0,
        drafts: {},
        textures: [],
        merchants: structuredClone(merchants),
        scenes: [
            scene("0", "maps", "The Design District", buildings),
            scene(
                "1",
                "maps",
                "Harbour Quarter",
                buildings.filter((_, index) => [6, 7, 8, 11, 12, 13].includes(index)),
            ),
            ...buildings.map((b, i) =>
                scene(String(i + 1), "spots", b.name, structuredClone(roomObjects), {
                    merchantId: i === 13 ? "common-objects" : "form-field",
                    parent: { type: "maps", id: "0" },
                }),
            ),
            scene(
                "1",
                "places",
                "The reading room",
                roomObjects.filter((o) => o.type !== "DOOR").map((o) => ({ ...o, id: `reading-${o.id}` })),
                { merchantId: "form-field", parent: { type: "spots", id: "13" } },
            ),
        ],
        meshes: [
            {
                id: "arc-chair",
                name: "Arc lounge chair",
                description: "Sculptural seating in warm boucle.",
                category: "Furniture",
                version: 1,
                status: "PUBLISHED",
                objects: [object("asset-chair", "CHAIR", "Arc lounge chair", [0, 0, 0], "#d8be88")],
                updatedAt: "2026-09-28T09:00:00.000Z",
            },
            {
                id: "orbit-light",
                name: "Orbit table light",
                description: "A playful pool of warm light.",
                category: "Lighting",
                version: 1,
                status: "PUBLISHED",
                objects: [object("asset-light", "LAMP", "Orbit table light", [0, 0, 0], "#d87543")],
                updatedAt: "2026-09-28T09:00:00.000Z",
            },
            {
                id: "pebble-table",
                name: "Pebble coffee table",
                description: "Organic shapes in solid oak.",
                category: "Furniture",
                version: 1,
                status: "PUBLISHED",
                objects: [object("asset-table", "TABLE", "Pebble coffee table", [0, 0, 0], "#aa7751")],
                updatedAt: "2026-09-28T09:00:00.000Z",
            },
        ],
    });
}
