import {
    Box3,
    BoxGeometry,
    CylinderGeometry,
    Group,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    TextureLoader,
    SRGBColorSpace,
    Vector3,
    BufferAttribute,
    type BufferGeometry,
    type Material,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { MeshResponseDTO, SceneObjectDTO, TextureResponseDTO, Vector3DTO } from "../../models/dto/mesh.dto";
import { workspaceService } from "./WorkspaceService";

export default class ModelFactoryService {
    private static INSTANCE: ModelFactoryService;
    public constructor(
        private readonly assetLoader?: (id: string, versionId: string) => Promise<string>,
        private readonly textureLoader?: (id: string) => Promise<TextureResponseDTO>,
    ) {}
    public static getInstance() {
        return (this.INSTANCE ??= new ModelFactoryService());
    }
    public resolveAsset?: (id: string, versionId: string) => Promise<string>;
    public resolveTexture?: (id: string) => Promise<TextureResponseDTO>;
    public async create(
        object: SceneObjectDTO,
        assets: MeshResponseDTO[],
        textures: TextureResponseDTO[],
    ): Promise<Group> {
        const group = new Group();
        group.name = object.name;
        group.userData.objectId = object.id;
        const mat = (color: string, roughness = 0.7) => {
            const material = new MeshStandardMaterial({ color, roughness });
            material.name = color === object.color ? "instance-base-color" : "detail-color";
            return material;
        };
        const add = (
            geometry: BufferGeometry,
            position: Vector3DTO,
            material: Material = mat(object.color),
            rotation?: Vector3DTO,
        ) => {
            const mesh = new Mesh(geometry, material);
            mesh.position.set(...position);
            if (rotation) mesh.rotation.set(...rotation);
            mesh.castShadow = mesh.receiveShadow = true;
            group.add(mesh);
            return mesh;
        };
        const box = (size: Vector3DTO, position: Vector3DTO, color = object.color, radius = 0.05) =>
            add(new RoundedBoxGeometry(...size, 3, Math.min(radius, ...size.map((s) => s / 3))), position, mat(color));
        const cylinder = (r1: number, r2: number, h: number, position: Vector3DTO, color = object.color) =>
            add(new CylinderGeometry(r1, r2, h, 40), position, mat(color));
        const loader = this.assetLoader || this.resolveAsset;
        if (object.assetId && object.assetVersionId && loader) {
            group.add((await new GLTFLoader().loadAsync(await loader(object.assetId, object.assetVersionId))).scene);
            if (object.type !== "ASSET" || object.colorOverride)
                group.traverse((child) => {
                    if (!(child instanceof Mesh)) return;
                    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
                        if (
                            material instanceof MeshStandardMaterial &&
                            (object.colorOverride || material.name === "instance-base-color")
                        )
                            material.color.set(object.color);
                    }
                });
        } else
            switch (object.type) {
                case "CHAIR":
                    [
                        [-0.64, 0.22, -0.55],
                        [0.64, 0.22, -0.55],
                        [-0.64, 0.22, 0.6],
                        [0.64, 0.22, 0.6],
                    ].forEach((p) => cylinder(0.065, 0.05, 0.44, p as Vector3DTO, "#66523c"));
                    box([1.55, 0.42, 1.5], [0, 0.5, 0], object.color, 0.2);
                    box([1.55, 1.15, 0.38], [0, 1.05, -0.62], object.color, 0.18).rotation.x = -0.12;
                    box([0.3, 0.65, 1.4], [-0.79, 0.84, 0], object.color, 0.14);
                    box([0.3, 0.65, 1.4], [0.79, 0.84, 0], object.color, 0.14);
                    box([1.19, 0.16, 1.16], [0, 0.79, 0.06], object.color, 0.07);
                    break;
                case "TABLE":
                    cylinder(0.92, 0.92, 0.16, [0, 0.72, 0]);
                    for (let i = 0; i < 3; i++)
                        cylinder(
                            0.12,
                            0.09,
                            0.68,
                            [Math.cos((i * Math.PI * 2) / 3) * 0.6, 0.33, Math.sin((i * Math.PI * 2) / 3) * 0.6],
                            "#806044",
                        );
                    break;
                case "LAMP":
                    cylinder(0.35, 0.4, 0.1, [0, 0.05, 0]);
                    cylinder(0.08, 0.1, 0.94, [0, 0.52, 0]);
                    add(new SphereGeometry(0.64, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), [0, 1, 0]);
                    cylinder(0.62, 0.62, 0.03, [0, 1, 0], "#f5e6bb");
                    break;
                case "PLANT":
                    cylinder(0.38, 0.27, 0.6, [0, 0.3, 0], "#b1987b");
                    cylinder(0.06, 0.07, 1.3, [0, 1, 0], "#675e39");
                    for (let i = 0; i < 8; i++) {
                        const leaf = add(new SphereGeometry(0.38, 16, 12), [
                            Math.sin(i * 2.4) * 0.4,
                            1.1 + i * 0.11,
                            Math.cos(i * 2.4) * 0.35,
                        ]);
                        leaf.scale.set(1, 0.38, 1.7);
                        leaf.rotation.set(0.3, i * 2.4, 0.2);
                    }
                    break;
                case "BUILDING":
                    box([7.5, 0.3, 7.5], [0, 0.15, 0], "#bdb9a9");
                    box([6, 3.5, 5.4], [0, 2, 0]);
                    box([6.3, 0.25, 5.7], [0, 3.85, 0], "#e1d4b9");
                    box([5.4, 0.12, 2], [0, 2.8, 3.1], "#d8f36a");
                    box([1.05, 2, 0.12], [0, 1.3, 2.76], "#373f3c");
                    [-1.8, 1.8].forEach((x) => box([1.9, 1.65, 0.14], [x, 1.65, 2.76], "#75847d"));
                    for (let i = 0; i < 3; i++) box([1.2, 0.75, 0.12], [-1.8 + i * 1.8, 3.1, -2.74], "#616d67");
                    cylinder(0.35, 0.3, 0.7, [-3.15, 0.7, 3.2], "#a68764");
                    add(new SphereGeometry(0.62, 20, 16), [-3.15, 1.5, 3.2], mat("#758057"));
                    break;
                case "DOOR":
                    box([1.4, 2.5, 0.2], [0, 1.25, 0]);
                    box([1.12, 2.23, 0.05], [0, 1.18, 0.13], "#333e36");
                    add(new SphereGeometry(0.055, 12, 12), [0.4, 1.15, 0.22], mat("#e1d7ac", 0.25));
                    break;
                case "SPHERE":
                    add(new SphereGeometry(0.75, 32, 24), [0, 0.75, 0]);
                    break;
                case "LIGHT":
                    add(
                        new SphereGeometry(0.12, 12, 12),
                        [0, 0, 0],
                        new MeshStandardMaterial({ color: object.color, emissive: object.color, emissiveIntensity: 2 }),
                    );
                    break;
                case "OBJ": {
                    if (!object.objSource) throw new Error(`Missing OBJ source for ${object.name}.`);
                    const model = new OBJLoader().parse(object.objSource);
                    model.traverse((child) => {
                        if (!(child instanceof Mesh)) return;
                        const oldMaterials = Array.isArray(child.material) ? child.material : [child.material];
                        oldMaterials.forEach((material) => material.dispose());
                        child.material = mat(object.color);
                        child.castShadow = child.receiveShadow = true;
                        if (!child.geometry.attributes.uv) {
                            child.geometry.computeBoundingBox();
                            const bounds = child.geometry.boundingBox!,
                                size = bounds.getSize(new Vector3());
                            const position = child.geometry.attributes.position,
                                uv = new Float32Array(position.count * 2);
                            for (let i = 0; i < position.count; i++) {
                                uv[i * 2] = (position.getX(i) - bounds.min.x) / (size.x || 1);
                                uv[i * 2 + 1] = (position.getY(i) - bounds.min.y) / (size.y || 1);
                            }
                            child.geometry.setAttribute("uv", new BufferAttribute(uv, 2));
                        }
                    });
                    group.add(workspaceService.normalize(model));
                    break;
                }
                case "ASSET": {
                    const asset = assets.find((item) => item.id === object.assetId);
                    if (!asset) throw new Error(`Mesh asset ${object.assetId} could not be found.`);
                    if (asset.glbUrl) group.add((await new GLTFLoader().loadAsync(asset.glbUrl)).scene);
                    else
                        for (const child of asset.objects) {
                            if (child.type === "ASSET") throw new Error("Nested mesh assets are not supported.");
                            const model = await this.create(child, assets, textures);
                            model.position.set(...child.position);
                            model.rotation.set(...child.rotation);
                            model.scale.set(...child.scale);
                            group.add(model);
                        }
                    break;
                }
                default:
                    add(new BoxGeometry(1, 1, 1), [0, 0, 0]);
            }
        if (object.textureId) {
            const textureAsset =
                textures.find((t) => t.id === object.textureId) ||
                (await (this.textureLoader || this.resolveTexture)?.(object.textureId));
            if (!textureAsset) throw new Error("A material texture is missing.");
            const texture = await new TextureLoader().loadAsync(textureAsset.url);
            texture.colorSpace = SRGBColorSpace;
            group.traverse((child) => {
                if (child instanceof Mesh) {
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    materials.forEach((material) => {
                        if (material instanceof MeshStandardMaterial) {
                            material.map = texture;
                            material.color.set("#ffffff");
                            material.needsUpdate = true;
                        }
                    });
                }
            });
        }
        group.traverse((child) => {
            child.userData.objectId = object.id;
        });
        return group;
    }
    public dispose(group: Group) {
        const textures = new Set();
        group.traverse((child) => {
            if (child instanceof Mesh) {
                child.geometry.dispose();
                (Array.isArray(child.material) ? child.material : [child.material]).forEach((material) => {
                    if (material instanceof MeshStandardMaterial && material.map && !textures.has(material.map)) {
                        textures.add(material.map);
                        material.map.dispose();
                    }
                    material.dispose();
                });
            }
        });
    }
    public bounds(group: Group) {
        return new Box3().setFromObject(group);
    }
}
export const modelFactory = ModelFactoryService.getInstance();
