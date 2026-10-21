import type { SceneObjectDTO, Vector3DTO } from "../../models/dto/mesh.dto";

type Origin = { longitude: number; latitude: number };

/** Local district projection in metres: +X east, +Z north, +Y height. */
export default class GeoCoordinateService {
    private static instance: GeoCoordinateService;
    public static getInstance() {
        return (this.instance ??= new GeoCoordinateService());
    }
    private longitudeScale(origin: Origin) {
        return 111320 * Math.max(0.000001, Math.cos((origin.latitude * Math.PI) / 180));
    }
    public toCoordinates(position: Vector3DTO, origin: Origin): Origin {
        return {
            longitude: origin.longitude + position[0] / this.longitudeScale(origin),
            latitude: origin.latitude + position[2] / 111320,
        };
    }
    public toPosition(coordinates: Origin, origin: Origin, height = 0): Vector3DTO {
        return [
            (coordinates.longitude - origin.longitude) * this.longitudeScale(origin),
            height,
            (coordinates.latitude - origin.latitude) * 111320,
        ];
    }
    public applyPatch(object: SceneObjectDTO, patch: Partial<SceneObjectDTO>, origin: Origin): SceneObjectDTO {
        const next = { ...object, ...patch };
        if (patch.longitude !== undefined || patch.latitude !== undefined) {
            const coordinates = { ...this.toCoordinates(object.position, origin), ...patch };
            next.position = this.toPosition(coordinates, origin, next.position[1]);
        }
        return { ...next, ...this.toCoordinates(next.position, origin) };
    }
}
export const geoCoordinates = GeoCoordinateService.getInstance();
