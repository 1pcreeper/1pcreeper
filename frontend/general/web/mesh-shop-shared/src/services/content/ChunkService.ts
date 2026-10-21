import type { SceneObjectDTO } from "../../models/dto/mesh.dto";
export const CHUNK_SIZE = 24;
export const CHUNK_RADIUS = 2;
export interface ChunkLocation {
    x: number;
    z: number;
}
export function withinChunks(object: SceneObjectDTO, center: ChunkLocation) {
    // Conservative overlap keeps large floors and walls visible across cell boundaries.
    const margin = Math.max(...object.scale) * 4;
    return (
        object.position[0] + margin >= (center.x - CHUNK_RADIUS) * CHUNK_SIZE &&
        object.position[0] - margin < (center.x + CHUNK_RADIUS + 1) * CHUNK_SIZE &&
        object.position[2] + margin >= (center.z - CHUNK_RADIUS) * CHUNK_SIZE &&
        object.position[2] - margin < (center.z + CHUNK_RADIUS + 1) * CHUNK_SIZE
    );
}
