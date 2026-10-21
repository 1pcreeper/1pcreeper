import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { Box3, Group, Mesh, Vector3 } from "three";
import type { SceneObjectDTO } from "../../models/dto/mesh.dto";
import { createObject } from "../../mock/world";

export default class WorkspaceService {
    private static INSTANCE: WorkspaceService;
    private constructor() {}
    public static getInstance() {
        return (this.INSTANCE ??= new WorkspaceService());
    }
    public async importObject(file: File): Promise<SceneObjectDTO> {
        if (!file.name.toLowerCase().endsWith(".obj")) throw new Error(`${file.name}: choose a Wavefront .obj file.`);
        if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name}: models must be smaller than 8 MB.`);
        const source = await file.text();
        const group = new OBJLoader().parse(source);
        let vertices = 0;
        group.traverse((child) => {
            if (child instanceof Mesh) vertices += child.geometry.attributes.position?.count || 0;
        });
        group.traverse((child) => {
            if (child instanceof Mesh) child.geometry.dispose();
        });
        if (!vertices || vertices > 600000) throw new Error("Use a valid OBJ with fewer than 600,000 vertices.");
        return { ...createObject("OBJ", file.name.replace(/\.obj$/i, "")), objSource: source };
    }
    public normalize(group: Group): Group {
        const box = new Box3().setFromObject(group),
            size = box.getSize(new Vector3()),
            center = box.getCenter(new Vector3());
        const factor = 2.5 / Math.max(size.x, size.y, size.z, 0.001);
        group.position.set(-center.x * factor, -box.min.y * factor, -center.z * factor);
        group.scale.setScalar(factor);
        return group;
    }
    public async image(file: File): Promise<string> {
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
            throw new Error("Choose a PNG, JPG, or WebP texture.");
        if (file.size > 4 * 1024 * 1024) throw new Error("Textures must be smaller than 4 MB.");
        const url = await this.readDataURL(file);
        await new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.onload = () =>
                image.width <= 4096 && image.height <= 4096
                    ? resolve()
                    : reject(new Error("Texture dimensions must be 4096 pixels or smaller."));
            image.onerror = () => reject(new Error("This image could not be decoded."));
            image.src = url;
        });
        return url;
    }
    public readDataURL(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Unable to read the file."));
            reader.readAsDataURL(blob);
        });
    }
    public async exportGLB(group: Group): Promise<Blob> {
        const result = await new GLTFExporter().parseAsync(group, { binary: true, onlyVisible: true });
        if (!(result instanceof ArrayBuffer)) throw new Error("GLB export failed.");
        return new Blob([result], { type: "model/gltf-binary" });
    }
    public download(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob),
            anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    public diff(
        before: SceneObjectDTO[],
        after: SceneObjectDTO[],
    ): { id: string; name: string; change: string; detail: string }[] {
        return [
            ...after.flatMap((object) => {
                const previous = before.find((item) => item.id === object.id);
                if (!previous) return [{ id: object.id, name: object.name, change: "Added", detail: object.type }];
                const keys = (Object.keys(object) as (keyof SceneObjectDTO)[]).filter(
                    (key) => JSON.stringify(previous[key]) !== JSON.stringify(object[key]),
                );
                return keys.length
                    ? [{ id: object.id, name: object.name, change: "Modified", detail: keys.join(", ") }]
                    : [];
            }),
            ...before
                .filter((object) => !after.some((item) => item.id === object.id))
                .map((object) => ({ id: object.id, name: object.name, change: "Removed", detail: object.type })),
        ];
    }
}
export const workspaceService = WorkspaceService.getInstance();
