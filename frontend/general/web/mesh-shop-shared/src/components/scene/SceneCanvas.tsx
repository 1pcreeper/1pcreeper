import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, createPortal, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Grid, OrbitControls, TransformControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { Box3, CanvasTexture, Group, PerspectiveCamera, Raycaster, SRGBColorSpace, Vector2, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type {
    MeshResponseDTO,
    SceneObjectDTO,
    TextureResponseDTO,
    TransformMode,
    Vector3DTO,
} from "../../models/dto/mesh.dto";
import { advanceJump } from "../../services/content/MovementService";
import { CHUNK_SIZE, withinChunks, type ChunkLocation } from "../../services/content/ChunkService";
import { modelFactory } from "../../services/content/ModelFactoryService";

interface Props {
    objects: SceneObjectDTO[];
    assets?: MeshResponseDTO[];
    textures?: TextureResponseDTO[];
    selectedId?: string;
    onSelect?: (id?: string) => void;
    onActivate?: (object: SceneObjectDTO) => void;
    onHover?: (object?: SceneObjectDTO, point?: { x: number; y: number }) => void;
    chunked?: boolean;
    chunkCenter?: ChunkLocation;
    spawn?: { position: Vector3DTO; yaw: number };
    paused?: boolean;
    onTransform?: (id: string, change: Partial<SceneObjectDTO>) => void;
    onTextureDrop?: (id: string, textureId: string) => void;
    onReady?: (group: Group) => void;
    onLoading?: (loading: boolean) => void;
    onError?: (message: string) => void;
    onChunk?: (x: number, z: number) => void;
    mode?: TransformMode;
    perspective?: "orbit" | "first";
    variant?: "room" | "map" | "asset" | "hero";
    grid?: boolean;
    resetKey?: number;
    autoRotate?: boolean;
}
const EMPTY_ASSETS: MeshResponseDTO[] = [],
    EMPTY_TEXTURES: TextureResponseDTO[] = [];
class ViewerBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
    public state = { error: false };
    public static getDerivedStateFromError() {
        return { error: true };
    }
    public render() {
        return this.state.error ? (
            <div className="viewer-fallback">
                <strong>3D preview is unavailable</strong>
                <p>Enable WebGL in your browser, then reload. You can still explore using the object list.</p>
            </div>
        ) : (
            this.props.children
        );
    }
}
function Model({
    object,
    assets,
    textures,
    onBuilt,
    onError,
}: {
    object: SceneObjectDTO;
    assets: MeshResponseDTO[];
    textures: TextureResponseDTO[];
    onBuilt: (id: string, group: Group | null) => void;
    onError?: Props["onError"];
}) {
    const [model, setModel] = useState<Group>();
    // Transforms never rebuild geometry; only source/material edits do.
    const sourceKey = JSON.stringify([
        object.type,
        object.objSource,
        object.color,
        object.colorOverride,
        object.assetId,
        object.assetVersionId,
        object.textureId,
    ]);
    useEffect(() => {
        let active = true,
            rendered: Group | undefined;
        onBuilt(object.id, null);
        modelFactory
            .create(object, assets, textures)
            .then((group) => {
                rendered = group;
                if (!active) {
                    modelFactory.dispose(group);
                    return;
                }
                setModel(group);
                onBuilt(object.id, group);
            })
            .catch((error) => {
                if (active) onError?.(error.message);
            });
        return () => {
            active = false;
            if (rendered) modelFactory.dispose(rendered);
            onBuilt(object.id, null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceKey, assets, textures, onBuilt, onError]);
    return model ? <primitive object={model} /> : null;
}
function ObjectNode({
    object,
    props,
    onBuilt,
}: {
    object: SceneObjectDTO;
    props: Props;
    onBuilt: (id: string, group: Group | null) => void;
}) {
    const ref = useRef<Group>(null!);
    const rootScene = useThree((state) => state.scene);
    const nearby = !props.chunked || withinChunks(object, props.chunkCenter || { x: 0, z: 0 });
    const selected = object.id === props.selectedId && !!props.onTransform;
    const node = (
        <group
            ref={ref}
            name={object.name}
            userData={{ objectId: object.id }}
            position={object.position}
            rotation={object.rotation}
            scale={object.scale}
            visible={object.visible && nearby}
            onClick={(event: ThreeEvent<MouseEvent>) => {
                event.stopPropagation();
                if (event.delta > 3) return;
                if (props.perspective === "first" && document.pointerLockElement) return;
                props.onSelect?.(object.id);
                props.onActivate?.(object);
            }}
            onPointerOver={(event) => {
                event.stopPropagation();
                if (props.onSelect || object.interaction) document.body.style.cursor = "pointer";
                if (object.interaction?.type === "PRODUCT")
                    props.onHover?.(object, { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY });
            }}
            onPointerOut={() => {
                document.body.style.cursor = "auto";
                props.onHover?.();
            }}
        >
            <Model
                object={object}
                assets={props.assets || EMPTY_ASSETS}
                textures={props.textures || EMPTY_TEXTURES}
                onBuilt={onBuilt}
                onError={props.onError}
            />
            {object.type === "LIGHT" && (
                <pointLight color={object.color} intensity={object.intensity ?? 15} distance={20} decay={2} />
            )}
        </group>
    );
    return (
        <>
            {node}
            {selected &&
                createPortal(
                    <TransformControls
                        object={ref}
                        mode={props.mode || "translate"}
                        onMouseUp={() => {
                            const group = ref.current;
                            props.onTransform?.(object.id, {
                                position: group.position.toArray() as Vector3DTO,
                                rotation: [group.rotation.x, group.rotation.y, group.rotation.z],
                                scale: group.scale.toArray() as Vector3DTO,
                            });
                        }}
                    />,
                    rootScene,
                )}
            {object.type === "BUILDING" &&
                object.visible &&
                nearby &&
                !props.onTransform &&
                props.perspective !== "first" && <MapLabel object={object} onActivate={props.onActivate} />}
        </>
    );
}
function MapLabel({ object, onActivate }: { object: SceneObjectDTO; onActivate?: Props["onActivate"] }) {
    const texture = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 768;
        canvas.height = 144;
        const context = canvas.getContext("2d")!;
        context.fillStyle = "#19221c";
        context.strokeStyle = "#82956c";
        context.lineWidth = 5;
        context.beginPath();
        context.roundRect(3, 3, 762, 138, 18);
        context.fill();
        context.stroke();
        context.font = "500 48px system-ui, sans-serif";
        context.fillStyle = "#e3eacb";
        context.textBaseline = "middle";
        context.fillText(object.name, 35, 72, 620);
        context.fillStyle = "#adca84";
        context.fillText("↗", 682, 72);
        const map = new CanvasTexture(canvas);
        map.colorSpace = SRGBColorSpace;
        return map;
    }, [object.name]);
    useEffect(() => () => texture.dispose(), [texture]);
    return (
        <sprite
            position={[object.position[0], 5, object.position[2]]}
            scale={[5.6, 1.05, 1]}
            renderOrder={10}
            onClick={(event) => {
                event.stopPropagation();
                if (event.delta <= 3) onActivate?.(object);
            }}
            onPointerOver={() => {
                document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
                document.body.style.cursor = "auto";
            }}
        >
            <spriteMaterial map={texture} depthTest={false} depthWrite={false} transparent />
        </sprite>
    );
}
function CameraRig({
    props,
    content,
    fitRevision,
}: {
    props: Props;
    content: React.RefObject<Group | null>;
    fitRevision: number;
}) {
    const { camera, gl, scene, size: viewportSize } = useThree();
    const orbit = useRef<OrbitControlsImpl>(null);
    const keys = useRef(new Set<string>());
    const lastChunk = useRef("");
    const angle = useRef({ yaw: 0, pitch: 0 });
    const first = props.perspective === "first";
    const vertical = useRef({ velocity: 0, jump: false });
    const spawn = props.spawn;
    const start = spawn?.position || [0, 0, props.variant === "map" ? 6 : 4];
    useEffect(() => {
        camera.position.set(
            ...((first
                ? [start[0], start[1] + 1.65, start[2]]
                : props.variant === "map"
                  ? [30, 30, 36]
                  : props.variant === "asset"
                    ? [5.5, 4.2, 6.2]
                    : props.variant === "hero"
                      ? [9, 7.5, 11]
                      : [12, 10, 15]) as Vector3DTO),
        );
        if (!first) camera.position.multiplyScalar(Math.max(1, Math.sqrt(viewportSize.height / viewportSize.width)));
        if (camera instanceof PerspectiveCamera) {
            camera.fov = first ? 60 : 40;
            camera.updateProjectionMatrix();
        }
        camera.lookAt(0, first ? 1.65 : 0, 0);
        angle.current = { yaw: spawn?.yaw || 0, pitch: 0 };
        vertical.current = { velocity: 0, jump: false };
        if (!first && spawn) camera.position.add(new Vector3(...spawn.position));
        orbit.current?.target.set(...(spawn?.position || ([0, 0, 0] as Vector3DTO)));
        orbit.current?.update();
        if (!first && document.pointerLockElement === gl.domElement) document.exitPointerLock();
        return () => {
            keys.current.clear();
            document.body.style.cursor = "auto";
        };
    }, [
        first,
        props.resetKey,
        props.variant,
        camera,
        gl,
        viewportSize.width,
        viewportSize.height,
        spawn?.position[0],
        spawn?.position[1],
        spawn?.position[2],
        spawn?.yaw,
    ]);
    useEffect(() => {
        if (props.variant !== "asset" || !content.current || !fitRevision) return;
        content.current.updateWorldMatrix(true, true);
        const box = new Box3().setFromObject(content.current);
        if (box.isEmpty()) return;
        const center = box.getCenter(new Vector3()),
            size = box.getSize(new Vector3());
        const distance =
            Math.max(3, size.x / Math.min(1, viewportSize.width / viewportSize.height), size.y, size.z) * 2.1;
        camera.position.copy(center).add(new Vector3(1, 0.75, 1.2).normalize().multiplyScalar(distance));
        camera.lookAt(center);
        orbit.current?.target.copy(center);
        orbit.current?.update();
    }, [fitRevision, props.resetKey, props.variant, camera, content, viewportSize.width, viewportSize.height]);
    useEffect(() => {
        const keydown = (event: KeyboardEvent) => {
            if (
                (event.target as HTMLElement).matches("input,textarea,select,[contenteditable=true]") ||
                document.querySelector("dialog[open]") ||
                !first ||
                props.paused
            )
                return;
            if (event.code === "Space") {
                event.preventDefault();
                if (!event.repeat) vertical.current.jump = true;
                return;
            }
            if (
                ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)
            ) {
                event.preventDefault();
                keys.current.add(event.code);
            }
        };
        const keyup = (event: KeyboardEvent) => keys.current.delete(event.code);
        const blur = () => keys.current.clear();
        const lock = () => {
            keys.current.clear();
        };
        let touch: { x: number; y: number } | null = null;
        const rotate = (x: number, y: number) => {
            angle.current.yaw -= x * 0.003;
            angle.current.pitch = Math.max(-1.3, Math.min(1.3, angle.current.pitch - y * 0.003));
        };
        const move = (event: MouseEvent) => {
            if (document.pointerLockElement === gl.domElement && first) rotate(event.movementX, event.movementY);
        };
        const touchStart = (event: TouchEvent) => {
            if (first) touch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        };
        const touchMove = (event: TouchEvent) => {
            if (first && touch) {
                rotate(event.touches[0].clientX - touch.x, event.touches[0].clientY - touch.y);
                touch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            }
        };
        const movement = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (detail.code === "Space" && detail.down) vertical.current.jump = true;
            else if (detail.down) keys.current.add(detail.code);
            else keys.current.delete(detail.code);
        };
        let mouse: { x: number; y: number } | null = null;
        const mouseDown = (event: PointerEvent) => {
            if (first && event.pointerType === "mouse" && event.button === 0)
                mouse = { x: event.clientX, y: event.clientY };
        };
        const mouseMove = (event: PointerEvent) => {
            if (mouse && first && !document.pointerLockElement && event.buttons & 1) {
                rotate(event.clientX - mouse.x, event.clientY - mouse.y);
                mouse = { x: event.clientX, y: event.clientY };
            }
        };
        const mouseUp = () => {
            mouse = null;
        };
        const interact = (event: MouseEvent) => {
            if (!first) return;
            if (matchMedia("(pointer:fine)").matches && document.pointerLockElement !== gl.domElement) {
                const rect = gl.domElement.getBoundingClientRect();
                const ray = new Raycaster();
                ray.setFromCamera(
                    new Vector2(
                        ((event.clientX - rect.left) / rect.width) * 2 - 1,
                        -((event.clientY - rect.top) / rect.height) * 2 + 1,
                    ),
                    camera,
                );
                const hit = ray.intersectObjects(content.current?.children || [], true)[0];
                const item = hit && props.objects.find((object) => object.id === hit.object.userData.objectId);
                // Direct object clicks work even in browsers that cannot capture the mouse.
                if (!item?.interaction) gl.domElement.requestPointerLock()?.catch(() => {});
                return;
            }
            if (document.pointerLockElement === gl.domElement && content.current) {
                const ray = new Raycaster();
                ray.setFromCamera(new Vector2(0, 0), camera);
                const hit = ray.intersectObjects(content.current.children, true)[0];
                if (hit && hit.distance < 15) {
                    const item = props.objects.find((o) => o.id === hit.object.userData.objectId);
                    if (item) {
                        document.exitPointerLock();
                        props.onActivate?.(item);
                    }
                }
            }
        };
        window.addEventListener("keydown", keydown);
        window.addEventListener("keyup", keyup);
        window.addEventListener("blur", blur);
        window.addEventListener("mesh-movement", movement);
        document.addEventListener("pointerlockchange", lock);
        document.addEventListener("mousemove", move);
        gl.domElement.addEventListener("click", interact);
        gl.domElement.addEventListener("pointerdown", mouseDown);
        gl.domElement.addEventListener("pointermove", mouseMove);
        window.addEventListener("pointerup", mouseUp);
        gl.domElement.addEventListener("touchstart", touchStart);
        gl.domElement.addEventListener("touchmove", touchMove);
        return () => {
            window.removeEventListener("keydown", keydown);
            window.removeEventListener("keyup", keyup);
            window.removeEventListener("blur", blur);
            window.removeEventListener("mesh-movement", movement);
            document.removeEventListener("pointerlockchange", lock);
            document.removeEventListener("mousemove", move);
            gl.domElement.removeEventListener("click", interact);
            gl.domElement.removeEventListener("pointerdown", mouseDown);
            gl.domElement.removeEventListener("pointermove", mouseMove);
            window.removeEventListener("pointerup", mouseUp);
            gl.domElement.removeEventListener("touchstart", touchStart);
            gl.domElement.removeEventListener("touchmove", touchMove);
        };
    }, [first, camera, gl, content, props.objects, props.onActivate, props.paused]);
    const dropHandler = useRef(props.onTextureDrop);
    dropHandler.current = props.onTextureDrop;
    useEffect(() => {
        const over = (e: DragEvent) => {
            if (e.dataTransfer?.types.includes("application/x-mesh-texture")) e.preventDefault();
        };
        const drop = (e: DragEvent) => {
            const texture = e.dataTransfer?.getData("application/x-mesh-texture");
            if (!texture) return;
            e.preventDefault();
            e.stopPropagation();
            const rect = gl.domElement.getBoundingClientRect();
            const ray = new Raycaster();
            ray.setFromCamera(
                new Vector2(
                    ((e.clientX - rect.left) / rect.width) * 2 - 1,
                    -((e.clientY - rect.top) / rect.height) * 2 + 1,
                ),
                camera,
            );
            const hit = ray
                .intersectObjects(content.current?.children || scene.children, true)
                .find((hit) => hit.object.userData.objectId);
            if (hit) dropHandler.current?.(hit.object.userData.objectId, texture);
        };
        gl.domElement.addEventListener("dragover", over);
        gl.domElement.addEventListener("drop", drop);
        return () => {
            gl.domElement.removeEventListener("dragover", over);
            gl.domElement.removeEventListener("drop", drop);
        };
    }, [gl, camera, scene, content]);
    const direction = useMemo(() => new Vector3(), []),
        next = useMemo(() => new Vector3(), []);
    useFrame((_, delta) => {
        if (props.paused || document.querySelector("dialog[open]")) {
            keys.current.clear();
            return;
        }
        if (first) {
            camera.rotation.order = "YXZ";
            camera.rotation.set(angle.current.pitch, angle.current.yaw, 0);
            const k = keys.current;
            direction
                .set(
                    Number(k.has("KeyD") || k.has("ArrowRight")) - Number(k.has("KeyA") || k.has("ArrowLeft")),
                    0,
                    Number(k.has("KeyS") || k.has("ArrowDown")) - Number(k.has("KeyW") || k.has("ArrowUp")),
                )
                .normalize()
                .applyAxisAngle(new Vector3(0, 1, 0), angle.current.yaw);
            next.copy(camera.position).addScaledVector(direction, Math.min(delta, 0.05) * 5);
            const blocked = content.current?.children.some((child) => {
                const item = props.objects.find((o) => o.id === child.userData.objectId);
                return (
                    item?.visible &&
                    (item.type === "BARRIER" || item.type === "BUILDING") &&
                    new Box3().setFromObject(child).expandByScalar(0.24).containsPoint(next)
                );
            });
            if (!blocked) camera.position.copy(next);
            let floor = 1.65;
            content.current?.children.forEach((child) => {
                const object = props.objects.find((item) => item.id === child.userData.objectId);
                if (object?.type !== "GROUND" || !object.visible) return;
                const box = new Box3().setFromObject(child);
                if (
                    camera.position.x >= box.min.x &&
                    camera.position.x <= box.max.x &&
                    camera.position.z >= box.min.z &&
                    camera.position.z <= box.max.z
                )
                    floor = Math.max(floor, box.max.y + 1.65);
            });
            camera.position.y = advanceJump(vertical.current, camera.position.y, floor, delta);
        }
        if (props.chunked && props.onChunk) {
            const center = first ? camera.position : orbit.current?.target || camera.position;
            const x = Math.floor(center.x / CHUNK_SIZE),
                z = Math.floor(center.z / CHUNK_SIZE),
                key = `${x}:${z}`;
            if (key !== lastChunk.current) {
                lastChunk.current = key;
                props.onChunk(x, z);
            }
        }
    });
    return first ? null : (
        <OrbitControls
            ref={orbit}
            makeDefault
            enableDamping
            autoRotate={props.autoRotate}
            autoRotateSpeed={0.4}
            maxPolarAngle={Math.PI / 2.03}
            minDistance={2}
            maxDistance={props.chunked ? 180 : 40}
        />
    );
}
function Scene({ props }: { props: Props }) {
    const group = useRef<Group>(null);
    const [fitRevision, setFitRevision] = useState(0);
    const loaded = useRef(new Map<string, Group>());
    const onBuilt = useCallback((id: string, value: Group | null) => {
        if (value) loaded.current.set(id, value);
        else loaded.current.delete(id);
    }, []);
    const lastReady = useRef(false);
    useFrame(() => {
        const ready = props.objects.every((o) => loaded.current.has(o.id));
        if (ready !== lastReady.current) {
            lastReady.current = ready;
            props.onLoading?.(!ready);
            if (ready) setFitRevision((value) => value + 1);
        }
    });
    useEffect(() => {
        if (group.current) props.onReady?.(group.current);
    }, [props.onReady]);
    useEffect(() => {
        props.onLoading?.(true);
        lastReady.current = false;
    }, [props.objects.length, props.onLoading]);
    return (
        <>
            <color attach="background" args={[props.variant === "map" ? "#202b28" : "#202224"]} />
            <ambientLight intensity={0.8} />
            <hemisphereLight args={["#fff4dc", "#757f72", 0.8]} />
            <directionalLight
                position={[8, 14, 8]}
                intensity={2.5}
                color="#fff1d5"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-35}
                shadow-camera-right={35}
                shadow-camera-top={35}
                shadow-camera-bottom={-35}
                shadow-normalBias={0.035}
            />
            <directionalLight position={[-6, 6, -3]} intensity={0.7} color="#d3e3f0" />
            <group ref={group}>
                {props.objects.map((object) => (
                    <ObjectNode key={object.id} object={object} props={props} onBuilt={onBuilt} />
                ))}
            </group>
            {!props.objects.some((o) => o.type === "GROUND") && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0]} receiveShadow>
                    <planeGeometry args={[250, 250]} />
                    <meshStandardMaterial color={props.variant === "map" ? "#58665a" : "#303337"} roughness={1} />
                </mesh>
            )}
            {props.grid !== false && (
                <Grid
                    position={[0, -0.015, 0]}
                    args={[200, 200]}
                    cellSize={1}
                    cellThickness={0.5}
                    cellColor="#60635f"
                    sectionSize={5}
                    sectionThickness={0.8}
                    sectionColor="#8a8e7e"
                    fadeDistance={props.variant === "map" ? 90 : 35}
                    infiniteGrid
                />
            )}
            <CameraRig props={props} content={group} fitRevision={fitRevision} />
            {props.perspective !== "first" && props.variant !== "hero" && (
                <GizmoHelper alignment="bottom-right" margin={[65, 65]}>
                    <GizmoViewport axisColors={["#d77465", "#a6bb80", "#779abb"]} labelColor="white" />
                </GizmoHelper>
            )}
        </>
    );
}
export default function SceneCanvas(props: Props) {
    return (
        <ViewerBoundary>
            <Canvas
                shadows
                dpr={[1, 1.5]}
                camera={{ fov: 40, near: 0.1, far: 350 }}
                fallback={
                    <div className="viewer-fallback">
                        Your browser does not support WebGL. Use the object list to explore.
                    </div>
                }
                onPointerMissed={() => props.onSelect?.(undefined)}
            >
                <Suspense fallback={null}>
                    <Scene props={props} />
                </Suspense>
            </Canvas>
        </ViewerBoundary>
    );
}
