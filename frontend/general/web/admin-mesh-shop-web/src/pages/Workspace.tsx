import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useBlocker, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowUpRight,
    Box,
    Check,
    ChevronDown,
    Circle,
    Download,
    Eye,
    EyeOff,
    FileBox,
    ImagePlus,
    Layers3,
    Move3d,
    Plus,
    Redo2,
    Rotate3d,
    RotateCcw,
    Save,
    Scaling,
    Search,
    Undo2,
    Upload,
    X,
} from "lucide-react";
import { Group } from "three";
import {
    createObject,
    Pagination,
    paginate,
    CHUNK_SIZE,
    withinChunks,
    modelFactory,
    geoCoordinates,
    ErrorState,
    isMockMode,
    Loading,
    Modal,
    ProductHover,
    ProductModal,
    useProductHover,
    Notice,
    SceneCanvas,
    services,
    useAsync,
    workspaceService,
    type DimensionType,
    type MeshResponseDTO,
    type ObjectType,
    type SceneObjectDTO,
    type SceneResponseDTO,
    type TextureResponseDTO,
    type TransformMode,
    type Vector3DTO,
} from "@mesh-shop/shared";
import { useObjectHistory } from "../hooks/useObjectHistory";
import ObjectInspector from "../components/ObjectInspector";

type Content = MeshResponseDTO | SceneResponseDTO;
interface WorkspaceData {
    content: Content;
    published: Content;
    textures: TextureResponseDTO[];
}
export default function Workspace({ kind }: { kind: "mesh" | DimensionType }) {
    const { id } = useParams();
    const resource = useAsync<WorkspaceData>(async () => {
        const textures = await services.mesh.findTextures({ size: 12 });
        const blank: MeshResponseDTO = {
            id: "",
            name: "Untitled mesh",
            description: "",
            category: "Furniture",
            objects: [],
            status: "DRAFT",
            version: 0,
            updatedAt: new Date().toISOString(),
        };
        if (kind === "mesh") {
            if (id && !/^\d+$/.test(id)) throw new Error("Mesh IDs must be numeric, for example /meshes/123.");
            const content = id ? await services.mesh.findById(id) : blank;
            return { content, published: content, textures: textures.content };
        }
        const metadata = await services.game.findById(kind, id!, true);
        const objects = await services.game.loadNearby({
            type: kind,
            id: id!,
            x: 0,
            z: 0,
            draft: true,
            snapshotVersion: metadata.version,
            draftRevision: metadata.draftRevision,
        });
        const content = { ...metadata, objects };
        let published = { ...metadata, objects: [] as SceneObjectDTO[] };
        if (metadata.version > 0) {
            const live = await services.game.findById(kind, id!);
            published = {
                ...live,
                objects: await services.game.loadNearby({
                    type: kind,
                    id: id!,
                    x: 0,
                    z: 0,
                    snapshotVersion: live.version,
                }),
            };
        }
        return { content, published, textures: textures.content };
    }, [kind, id]);
    if (resource.loading) return <Loading label="Setting up your canvas…" />;
    if (resource.error || !resource.data) return <ErrorState error={resource.error} onRetry={resource.reload} />;
    return <Editor key={`${kind}/${id || "new"}`} kind={kind} data={resource.data} />;
}
function Editor({ kind, data }: { kind: "mesh" | DimensionType; data: WorkspaceData }) {
    const navigate = useNavigate(),
        history = useObjectHistory(data.content.objects);
    const [content, setContent] = useState(data.content),
        [published, setPublished] = useState(data.published),
        [saved, setSaved] = useState(JSON.stringify(data.content));
    const [textures, setTextures] = useState(data.textures),
        [selectedId, setSelectedId] = useState<string>(),
        [mode, setMode] = useState<TransformMode>("translate");
    const [leftTab, setLeftTab] = useState("objects"),
        [rightTab, setRightTab] = useState("properties"),
        [grid, setGrid] = useState(true),
        [reset, setReset] = useState(0),
        [search, setSearch] = useState("");
    const [busy, setBusy] = useState(false),
        [modelsLoading, setModelsLoading] = useState(true),
        [notice, setNotice] = useState(""),
        [error, setError] = useState(""),
        [commitOpen, setCommitOpen] = useState(false),
        [dragging, setDragging] = useState(false),
        [panel, setPanel] = useState<"objects" | "properties" | null>(null);
    const [assetPage, setAssetPage] = useState(0),
        [texturePage, setTexturePage] = useState(0),
        [objectPage, setObjectPage] = useState(0),
        [changePage, setChangePage] = useState(0);
    const [chunkCenter, setChunkCenter] = useState({ x: 0, z: 0 }),
        [chunksLoading, setChunksLoading] = useState(false);
    const assetResource = useAsync(
        () => services.mesh.findPage({ page: assetPage, size: 10, search: leftTab === "assets" ? search : "" }),
        [assetPage, search, leftTab],
    );
    const textureResource = useAsync(() => services.mesh.findTextures({ page: texturePage, size: 12 }), [texturePage]);
    useEffect(() => {
        if (textureResource.data) setTextures(textureResource.data.content);
    }, [textureResource.data]);
    useEffect(() => {
        setAssetPage(0);
        setObjectPage(0);
    }, [search, leftTab]);
    const group = useRef<Group | null>(null),
        input = useRef<HTMLInputElement>(null),
        textureInput = useRef<HTMLInputElement>(null),
        bypassNavigation = useRef(false),
        dragDepth = useRef(0);
    const objects = history.objects,
        selected = objects.find((o) => o.id === selectedId);
    const current = useMemo(() => ({ ...content, objects }), [content, objects]);
    const dirty = JSON.stringify(current) !== saved;
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            dirty && !bypassNavigation.current && currentLocation.pathname !== nextLocation.pathname,
    );
    const changes = workspaceService.diff(published.objects, objects);
    const metadataChanged =
        content.name !== published.name ||
        content.description !== published.description ||
        ("category" in content && "category" in published && content.category !== published.category);
    const changeCount = changes.length + Number(metadataChanged);
    const onTransform = useCallback(
        (id: string, patch: Partial<SceneObjectDTO>) =>
            history.update((objects) =>
                objects.map((object) => {
                    if (object.id !== id) return object;
                    return kind === "maps" && "longitude" in content
                        ? geoCoordinates.applyPatch(object, patch, content)
                        : { ...object, ...patch };
                }),
            ),
        [history.update, kind, content],
    );
    const savedRef = useRef(saved);
    savedRef.current = saved;
    const hover = useProductHover();
    const [detailProduct, setDetailProduct] = useState<string>();
    const lastChunk = useRef(`0:0:${content.version}`);
    const onChunk = useCallback(
        (x: number, z: number) =>
            setChunkCenter((previous) => (previous.x === x && previous.z === z ? previous : { x, z })),
        [],
    );
    useEffect(() => {
        if (kind === "mesh") return;
        const key = `${chunkCenter.x}:${chunkCenter.z}:${content.version}`;
        if (lastChunk.current === key) return;
        const controller = new AbortController();
        setChunksLoading(true);
        const query = {
            type: kind,
            id: content.id,
            ...chunkCenter,
            snapshotVersion: content.version,
            draftRevision: (content as SceneResponseDTO).draftRevision,
        };
        Promise.all([
            services.game.loadNearby({ ...query, draft: true }, controller.signal),
            content.version > 0 ? services.game.loadNearby(query, controller.signal) : Promise.resolve([]),
        ])
            .then(([incoming, live]) => {
                if (controller.signal.aborted) return;
                const previous = JSON.parse(savedRef.current) as Content;
                const known = new Set(previous.objects.map((object) => object.id));
                const additions = incoming.filter((object) => !known.has(object.id));
                history.mergeRemote(additions);
                setSaved((value) => {
                    const saved = JSON.parse(value) as Content;
                    return JSON.stringify({ ...saved, objects: [...saved.objects, ...additions] });
                });
                setPublished((value) => ({
                    ...value,
                    objects: [
                        ...value.objects,
                        ...live.filter((object) => !value.objects.some((existing) => existing.id === object.id)),
                    ],
                }));
                lastChunk.current = key;
            })
            .catch((error) => {
                if (!controller.signal.aborted) setError(error.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setChunksLoading(false);
            });
        return () => controller.abort();
    }, [kind, content.id, content.version, chunkCenter.x, chunkCenter.z, history.mergeRemote]);
    useEffect(() => setObjectPage(0), [chunkCenter.x, chunkCenter.z]);
    const nearbyObjects = objects.filter(
        (object) =>
            (kind === "mesh" || withinChunks(object, chunkCenter)) &&
            object.name.toLowerCase().includes(search.toLowerCase()),
    );
    const hierarchy = paginate(nearbyObjects, { page: objectPage, size: 20 });
    const onReady = useCallback((value: Group) => {
        group.current = value;
    }, []);
    const onError = useCallback((message: string) => setError(message), []);
    const textureDrop = useCallback(
        (id: string, textureId: string) => {
            onTransform(id, { textureId });
            setSelectedId(id);
            setNotice("Texture applied to the selected model.");
        },
        [onTransform],
    );
    const add = (type: ObjectType) => {
        const object = createObject(
            type,
            type[0] + type.slice(1).toLowerCase(),
            kind === "mesh" ? [0, 0, 0] : [chunkCenter.x * CHUNK_SIZE, 0, chunkCenter.z * CHUNK_SIZE],
        );
        if (type === "GROUND") {
            object.scale = [12, 0.2, 10];
            object.position[1] = -0.1;
        }
        if (type === "BARRIER") {
            object.scale = [4, 3, 0.2];
            object.position[1] = 1.5;
        }
        if (type === "LIGHT") object.position[1] = 3;
        if (kind === "maps" && "longitude" in content)
            Object.assign(object, geoCoordinates.toCoordinates(object.position, content));
        history.update((items) => [...items, object]);
        setSelectedId(object.id);
        setNotice("");
    };
    const remove = useCallback(() => {
        if (selectedId) history.update((items) => items.filter((o) => o.id !== selectedId));
        setSelectedId(undefined);
    }, [selectedId, history.update]);
    const duplicate = useCallback(() => {
        if (!selected) return;
        const copy = { ...structuredClone(selected), id: crypto.randomUUID(), name: `${selected.name} copy` };
        copy.position[0] += 1.5;
        if (kind === "maps" && "longitude" in content)
            Object.assign(copy, geoCoordinates.toCoordinates(copy.position, content));
        history.update((items) => [...items, copy]);
        setSelectedId(copy.id);
    }, [selected, history.update, kind, content]);
    useEffect(() => {
        const warn = (event: BeforeUnloadEvent) => {
            if (dirty) {
                event.preventDefault();
                event.returnValue = "";
            }
        };
        const shortcuts = (event: KeyboardEvent) => {
            if (
                (event.target as HTMLElement).matches("input,textarea,select,[contenteditable=true]") ||
                commitOpen ||
                busy ||
                document.querySelector("dialog[open]")
            )
                return;
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
                event.preventDefault();
                if (event.shiftKey) history.redo();
                else history.undo();
                return;
            }
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.key.toLowerCase() === "g") setMode("translate");
            if (event.key.toLowerCase() === "r") setMode("rotate");
            if (event.key.toLowerCase() === "s") {
                event.preventDefault();
                setMode("scale");
            }
            if (event.key === "Delete" || event.key === "Backspace") {
                event.preventDefault();
                remove();
            }
            if (event.key === "Escape") setSelectedId(undefined);
        };
        window.addEventListener("beforeunload", warn);
        window.addEventListener("keydown", shortcuts);
        return () => {
            window.removeEventListener("beforeunload", warn);
            window.removeEventListener("keydown", shortcuts);
        };
    }, [dirty, commitOpen, busy, history.undo, history.redo, remove]);
    useEffect(() => {
        const endDrag = () => {
            dragDepth.current = 0;
            setDragging(false);
        };
        window.addEventListener("drop", endDrag, true);
        window.addEventListener("dragend", endDrag);
        return () => {
            window.removeEventListener("drop", endDrag, true);
            window.removeEventListener("dragend", endDrag);
        };
    }, []);
    const importFiles = async (files: File[]) => {
        if (!files.length) return;
        setBusy(true);
        setError("");
        setNotice("");
        const imported: SceneObjectDTO[] = [],
            addedTextures: TextureResponseDTO[] = [],
            failures: string[] = [];
        for (const file of files.slice(0, 20)) {
            try {
                if (file.name.toLowerCase().endsWith(".obj")) {
                    const object = await workspaceService.importObject(file);
                    object.position[0] = (objects.length + imported.length) * 2.8;
                    imported.push(object);
                } else {
                    const texture = {
                        id: crypto.randomUUID(),
                        name: file.name,
                        url: await workspaceService.image(file),
                    };
                    await services.mesh.createTexture(texture);
                    addedTextures.push(texture);
                }
            } catch (error) {
                failures.push((error as Error).message);
            }
        }
        if (files.length > 20) failures.push("Import up to 20 files at a time.");
        if (imported.length) {
            history.update((items) => [...items, ...imported]);
            setSelectedId(imported.at(-1)!.id);
            setReset((value) => value + 1);
        }
        if (addedTextures.length) {
            setTextures((items) => [...items, ...addedTextures]);
            textureResource.reload();
        }
        setError(failures.join(" "));
        setNotice(
            `${imported.length} model${imported.length === 1 ? "" : "s"} and ${addedTextures.length} texture${addedTextures.length === 1 ? "" : "s"} imported.`,
        );
        setBusy(false);
        if (input.current) input.current.value = "";
        if (textureInput.current) textureInput.current.value = "";
    };
    const prepareScene = async () => {
        const prepared: SceneObjectDTO[] = [];
        for (const object of objects) {
            if (object.assetId || ["GROUND", "BARRIER", "LIGHT"].includes(object.type)) {
                prepared.push(object);
                continue;
            }
            const source = {
                ...object,
                interaction: undefined,
                productId: undefined,
                target: undefined,
                position: [0, 0, 0] as Vector3DTO,
                rotation: [0, 0, 0] as Vector3DTO,
                scale: [1, 1, 1] as Vector3DTO,
            };
            const model = await modelFactory.create(source, [], textures);
            try {
                const group = new Group();
                group.add(model);
                const mesh = await services.mesh.commit({
                    id: "",
                    name: object.name,
                    description: "Created in a space",
                    category: "Other",
                    version: 0,
                    status: "DRAFT",
                    updatedAt: new Date().toISOString(),
                    objects: [source],
                    glbUrl: await workspaceService.readDataURL(await workspaceService.exportGLB(group)),
                });
                prepared.push({
                    ...object,
                    type: "ASSET",
                    objSource: undefined,
                    assetId: mesh.id,
                    assetVersionId: mesh.versionId,
                });
            } finally {
                modelFactory.dispose(model);
            }
        }
        history.reset(prepared);
        return { ...current, objects: prepared } as SceneResponseDTO;
    };
    const saveDraft = async () => {
        setBusy(true);
        setError("");
        try {
            const result = await services.game.saveDraft(
                await prepareScene(),
                (JSON.parse(saved) as SceneResponseDTO).objects,
            );
            setContent(result);
            setSaved(JSON.stringify(result));
            setNotice("Draft saved. Visitors still see the published version.");
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBusy(false);
        }
    };
    const exportGLB = async () => {
        if (!group.current) return;
        setBusy(true);
        setError("");
        try {
            workspaceService.download(
                await workspaceService.exportGLB(group.current),
                `${content.name.replace(/[^a-z0-9-]/gi, "-") || "mesh"}.glb`,
            );
            setNotice("GLB exported with models, transforms, and textures.");
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBusy(false);
        }
    };
    const commit = async () => {
        setBusy(true);
        setError("");
        try {
            let result: Content;
            if (kind === "mesh") {
                if (!group.current || modelsLoading) throw new Error("Wait for all models to finish loading.");
                const blob = await workspaceService.exportGLB(group.current);
                result = await services.mesh.commit({
                    ...(current as MeshResponseDTO),
                    glbUrl: await workspaceService.readDataURL(blob),
                });
            } else {
                const draft = await services.game.saveDraft(
                    await prepareScene(),
                    (JSON.parse(saved) as SceneResponseDTO).objects,
                );
                result = await services.game.publish(draft);
            }
            history.reset(result.objects);
            setContent(result);
            setPublished(result);
            setSaved(JSON.stringify(result));
            setCommitOpen(false);
            setNotice(
                kind === "mesh"
                    ? `Version ${result.version} committed. This mesh is ready to reuse.`
                    : `Version ${result.version} published. Your space is ready to explore.`,
            );
            if (kind === "mesh" && !content.id) {
                bypassNavigation.current = true;
                navigate(`/meshes/${result.id}`, { replace: true });
            }
        } catch (error) {
            setError((error as Error).message);
            setCommitOpen(false);
        } finally {
            setBusy(false);
        }
    };
    const discard = async () => {
        setBusy(true);
        setError("");
        try {
            if (kind !== "mesh") await services.game.discardDraft(current as SceneResponseDTO);
            history.reset(published.objects);
            setContent(published);
            setSaved(JSON.stringify(published));
            setNotice("Restored the last published version.");
            setSelectedId(undefined);
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBusy(false);
        }
    };
    return (
        <div
            className="editor-app"
            onDragEnter={(e) => {
                if (
                    e.dataTransfer.types.includes("Files") &&
                    !e.dataTransfer.types.includes("application/x-mesh-texture")
                ) {
                    e.preventDefault();
                    dragDepth.current++;
                    setDragging(true);
                }
            }}
            onDragOver={(e) => {
                if (
                    e.dataTransfer.types.includes("Files") &&
                    !e.dataTransfer.types.includes("application/x-mesh-texture")
                )
                    e.preventDefault();
            }}
            onDragLeave={() => {
                dragDepth.current--;
                if (dragDepth.current <= 0) setDragging(false);
            }}
            onDrop={(e) => {
                if (e.dataTransfer.files.length) {
                    e.preventDefault();
                    setDragging(false);
                    dragDepth.current = 0;
                    if (!busy) void importFiles(Array.from(e.dataTransfer.files));
                }
            }}
        >
            <header className="editor-header">
                <Link
                    to={kind === "mesh" ? "/meshes" : "/dashboard"}
                    className="icon-button"
                    aria-label="Back to workspace"
                >
                    <ArrowLeft size={19} />
                </Link>
                <div className="editor-title">
                    <span>{kind === "mesh" ? "MESH LIBRARY" : `${kind.toUpperCase()} / SCENE EDITOR`}</span>
                    <strong>
                        {content.name}
                        <span className={`dirty-dot ${dirty ? "unsaved" : ""}`} />
                    </strong>
                </div>
                <span className="tag editor-version">
                    v{content.version} · {isMockMode ? "LOCAL" : "LIVE"}
                </span>
                <div className="editor-header-actions">
                    {kind !== "mesh" && (
                        <>
                            <a
                                className="button secondary"
                                target="_blank"
                                rel="noreferrer"
                                href={`${import.meta.env.VITE_USER_APP_URL || "http://localhost:5173"}/game/${kind}/${content.id}`}
                            >
                                View live <ArrowUpRight size={14} />
                            </a>
                            <button
                                className="button secondary"
                                disabled={busy || chunksLoading || !dirty}
                                onClick={() => void saveDraft()}
                            >
                                <Save size={15} />
                                Save draft
                            </button>
                        </>
                    )}
                    <button
                        className="button secondary"
                        disabled={busy || chunksLoading || modelsLoading || !objects.length}
                        onClick={() => void exportGLB()}
                    >
                        <Download size={15} />
                        <span>{kind === "mesh" ? "Export GLB" : "Export visible GLB"}</span>
                    </button>
                    <button
                        className="button primary"
                        disabled={
                            busy ||
                            chunksLoading ||
                            modelsLoading ||
                            (kind === "mesh" && !objects.length) ||
                            !content.name.trim()
                        }
                        onClick={() => {
                            setRightTab("changes");
                            setCommitOpen(true);
                        }}
                    >
                        <Check size={16} />
                        {busy ? "Working…" : kind === "mesh" ? "Commit mesh" : "Publish changes"}
                    </button>
                </div>
            </header>
            <div className="editor-layout" inert={busy}>
                <aside className={`editor-left ${panel === "objects" ? "panel-open" : ""}`}>
                    <div className="panel-tabs">
                        <button className={leftTab === "objects" ? "active" : ""} onClick={() => setLeftTab("objects")}>
                            <Layers3 size={14} />
                            Scene
                        </button>
                        <button className={leftTab === "assets" ? "active" : ""} onClick={() => setLeftTab("assets")}>
                            <Box size={14} />
                            Assets
                        </button>
                        <button
                            className="icon-button mobile-only"
                            aria-label="Close objects"
                            onClick={() => setPanel(null)}
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="hierarchy-search search-input">
                        <Search size={14} />
                        <input
                            aria-label="Search objects"
                            value={search}
                            placeholder="Find an object…"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="list-label">
                        <span>{leftTab === "objects" ? "SCENE COLLECTION" : "REUSABLE MESHES"}</span>
                        <span>{leftTab === "objects" ? objects.length : assetResource.data?.totalElements || 0}</span>
                    </div>
                    <div className="hierarchy-list">
                        {leftTab === "objects"
                            ? hierarchy.content.map((object) => (
                                  <div
                                      className={`hierarchy-row ${selectedId === object.id ? "selected" : ""}`}
                                      key={object.id}
                                  >
                                      <button
                                          className="hierarchy-select"
                                          onClick={() => {
                                              setSelectedId(object.id);
                                              setRightTab("properties");
                                          }}
                                      >
                                          <Box size={14} />
                                          <span>{object.name}</span>
                                      </button>
                                      <button
                                          className="icon-button"
                                          aria-label={`${object.visible ? "Hide" : "Show"} ${object.name}`}
                                          onClick={() => onTransform(object.id, { visible: !object.visible })}
                                      >
                                          {object.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                                      </button>
                                  </div>
                              ))
                            : (assetResource.data?.content || []).map((asset) => (
                                  <button
                                      key={asset.id}
                                      className="asset-list-item"
                                      disabled={kind === "mesh"}
                                      title={
                                          kind === "mesh"
                                              ? "Add reusable assets in the scene editor"
                                              : "Add an instance to this space"
                                      }
                                      onClick={() => {
                                          const object = {
                                              ...createObject("ASSET", asset.name, [
                                                  chunkCenter.x * CHUNK_SIZE,
                                                  0,
                                                  chunkCenter.z * CHUNK_SIZE,
                                              ]),
                                              assetId: asset.id,
                                              assetVersionId: asset.versionId,
                                          };
                                          history.update((items) => [...items, object]);
                                          setSelectedId(object.id);
                                      }}
                                  >
                                      <Box size={17} />
                                      <span>
                                          {asset.name}
                                          <small>
                                              v{asset.version} · {asset.category}
                                          </small>
                                      </span>
                                      <Plus size={14} />
                                  </button>
                              ))}
                        {!objects.length && leftTab === "objects" && (
                            <div className="empty-hierarchy">
                                <Box size={26} />
                                <p>Your canvas is a blank slate.</p>
                                <span>Drop in an OBJ to get started.</span>
                            </div>
                        )}
                    </div>
                    <Pagination
                        data={leftTab === "objects" ? hierarchy : assetResource.data}
                        onPage={leftTab === "objects" ? setObjectPage : setAssetPage}
                        label={leftTab === "objects" ? "Objects" : "Assets"}
                    />
                    {assetResource.error && <Notice error>{assetResource.error}</Notice>}
                    <button className="button import-button" disabled={busy} onClick={() => input.current?.click()}>
                        <Upload size={15} />
                        Import models
                    </button>
                    <div className="texture-section">
                        <div className="panel-heading">
                            <span className="field-title">TEXTURE ASSETS</span>
                            <button
                                className="icon-button"
                                aria-label="Upload textures"
                                disabled={busy}
                                onClick={() => textureInput.current?.click()}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        {textureResource.error && <Notice error>{textureResource.error}</Notice>}
                        <Pagination data={textureResource.data} onPage={setTexturePage} label="Textures" />
                        {textures.length ? (
                            <div className="texture-grid">
                                {textures.map((texture) => (
                                    <button
                                        draggable
                                        key={texture.id}
                                        className="texture-tile"
                                        title={`${texture.name} — drag onto a model or click to apply to selection`}
                                        onDragStart={(event) =>
                                            event.dataTransfer.setData("application/x-mesh-texture", texture.id)
                                        }
                                        onClick={() => {
                                            if (selectedId) textureDrop(selectedId, texture.id);
                                            else
                                                setNotice("Select a model first, or drag a texture onto the viewport.");
                                        }}
                                    >
                                        <img draggable={false} src={texture.url} alt={texture.name} />
                                        <span>{texture.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <button
                                className="texture-drop"
                                disabled={busy}
                                onClick={() => textureInput.current?.click()}
                            >
                                <ImagePlus size={24} />
                                <span>Add a little texture</span>
                                <small>PNG, JPG, WebP · up to 4 MB</small>
                            </button>
                        )}
                        <p className="hint">Drag a texture onto a model, or click to apply it to your selection.</p>
                    </div>
                    <div className="editor-local-note">
                        <span className="status-dot" />
                        {isMockMode ? "Files stay on this device" : "Connected to your gateway"}
                    </div>
                </aside>
                <section className="editor-center">
                    <div className="editor-toolbar">
                        <button
                            className="tool-button mobile-only"
                            aria-label="Open objects"
                            onClick={() => setPanel("objects")}
                        >
                            <Layers3 size={16} />
                        </button>
                        <div className="transform-tools">
                            {(
                                [
                                    { value: "translate", icon: Move3d, key: "G", label: "Move" },
                                    { value: "rotate", icon: Rotate3d, key: "R", label: "Rotate" },
                                    { value: "scale", icon: Scaling, key: "S", label: "Scale" },
                                ] as const
                            ).map((tool) => (
                                <button
                                    key={tool.value}
                                    className={`transform-tool ${mode === tool.value ? "active" : ""}`}
                                    title={`${tool.label} (${tool.key})`}
                                    aria-label={tool.label}
                                    onClick={() => setMode(tool.value)}
                                >
                                    <tool.icon size={17} />
                                    <span>{tool.label}</span>
                                    <kbd>{tool.key}</kbd>
                                </button>
                            ))}
                        </div>
                        <div className="toolbar-separator" />
                        <button
                            className="tool-button"
                            aria-label="Undo"
                            disabled={!history.canUndo}
                            onClick={history.undo}
                        >
                            <Undo2 size={16} />
                        </button>
                        <button
                            className="tool-button"
                            aria-label="Redo"
                            disabled={!history.canRedo}
                            onClick={history.redo}
                        >
                            <Redo2 size={16} />
                        </button>
                        <details className="add-menu">
                            <summary>
                                <Plus size={15} />
                                Add
                                <ChevronDown size={12} />
                            </summary>
                            <div>
                                {(
                                    [
                                        "CHAIR",
                                        "TABLE",
                                        "LAMP",
                                        "PLANT",
                                        "BOX",
                                        "SPHERE",
                                        ...(kind !== "mesh" ? ["GROUND", "BARRIER", "LIGHT", "DOOR", "BUILDING"] : []),
                                    ] as ObjectType[]
                                ).map((type) => (
                                    <button
                                        key={type}
                                        onClick={(e) => {
                                            add(type);
                                            e.currentTarget.closest("details")?.removeAttribute("open");
                                        }}
                                    >
                                        {type[0] + type.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </details>
                        <button
                            className="tool-button mobile-only"
                            aria-label="Open properties"
                            onClick={() => setPanel("properties")}
                        >
                            <Box size={16} />
                        </button>
                    </div>
                    <div className="editor-canvas">
                        <SceneCanvas
                            objects={objects}
                            paused={busy || Boolean(detailProduct)}
                            chunked={kind !== "mesh"}
                            chunkCenter={chunkCenter}
                            onChunk={kind !== "mesh" ? onChunk : undefined}
                            textures={textures}
                            variant={kind === "maps" ? "map" : kind === "mesh" ? "asset" : "room"}
                            selectedId={selectedId}
                            onSelect={(id) => {
                                setSelectedId(id);
                                hover.close();
                            }}
                            onHover={kind === "mesh" ? undefined : hover.onHover}
                            onTransform={onTransform}
                            onTextureDrop={textureDrop}
                            onReady={onReady}
                            onLoading={setModelsLoading}
                            onError={onError}
                            mode={mode}
                            grid={grid}
                            resetKey={reset}
                        />
                        <div className="viewport-label">
                            <Circle size={8} fill="currentColor" />
                            Perspective<span>Solid</span>
                        </div>
                        <div className="editor-view-tools">
                            <button
                                className={`tool-button ${grid ? "active" : ""}`}
                                aria-label="Toggle grid"
                                onClick={() => setGrid(!grid)}
                            >
                                <Layers3 size={16} />
                            </button>
                            <button
                                className="tool-button"
                                aria-label="Reset camera"
                                onClick={() => setReset((value) => value + 1)}
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                        {!objects.length && (
                            <div className="empty-stage">
                                <div className="empty-stage-icon">
                                    <FileBox size={35} strokeWidth={1.1} />
                                </div>
                                <h2>Give your ideas a little dimension.</h2>
                                <p>
                                    Drop your OBJ files anywhere to begin.
                                    <br />
                                    Add multiple models and make them your own.
                                </p>
                                <button className="button primary" onClick={() => input.current?.click()}>
                                    <Upload size={15} />
                                    Choose files
                                </button>
                                <span>OBJ models · PNG, JPG & WebP textures</span>
                            </div>
                        )}
                        {(notice || error) && (
                            <div className="editor-notice">
                                <Notice error={Boolean(error)}>{error || notice}</Notice>
                                <button
                                    className="icon-button"
                                    aria-label="Dismiss notification"
                                    onClick={() => {
                                        setNotice("");
                                        setError("");
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                    <footer className="editor-statusbar">
                        <span>
                            <span className="status-dot" />
                            {busy
                                ? "Working…"
                                : modelsLoading && objects.length
                                  ? "Loading models…"
                                  : dirty
                                    ? "Unsaved changes"
                                    : "All changes saved"}
                        </span>
                        <span>
                            {nearbyObjects.length} nearby / {objects.length} loaded <i />
                            {chunksLoading && "Loading chunks…"}
                            {selected ? "1 selected" : "None selected"}
                        </span>
                        <span>Y UP · METRES</span>
                    </footer>
                </section>
                <aside className={`editor-right ${panel === "properties" ? "panel-open" : ""}`}>
                    <div className="panel-tabs">
                        <button
                            className={rightTab === "properties" ? "active" : ""}
                            onClick={() => setRightTab("properties")}
                        >
                            Properties
                        </button>
                        <button
                            className={rightTab === "changes" ? "active" : ""}
                            onClick={() => setRightTab("changes")}
                        >
                            Changes <span className="count-badge">{changeCount}</span>
                        </button>
                        <button
                            className="icon-button mobile-only"
                            aria-label="Close properties"
                            onClick={() => setPanel(null)}
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="inspector-scroll">
                        {rightTab === "properties" ? (
                            <>
                                <div className="content-metadata">
                                    <span className="field-title">
                                        {kind === "mesh" ? "MESH DETAILS" : "SPACE DETAILS"}
                                    </span>
                                    <label>
                                        Name
                                        <input
                                            aria-label="Workspace name"
                                            maxLength={120}
                                            value={content.name}
                                            onChange={(e) => setContent({ ...content, name: e.target.value })}
                                        />
                                    </label>
                                    <label>
                                        Description
                                        <textarea
                                            rows={2}
                                            maxLength={1000}
                                            value={content.description}
                                            onChange={(e) => setContent({ ...content, description: e.target.value })}
                                        />
                                    </label>
                                    {"category" in content && (
                                        <label>
                                            Category
                                            <select
                                                value={content.category}
                                                onChange={(e) => setContent({ ...content, category: e.target.value })}
                                            >
                                                {["Furniture", "Lighting", "Architecture", "Decoration", "Other"].map(
                                                    (category) => (
                                                        <option key={category}>{category}</option>
                                                    ),
                                                )}
                                            </select>
                                        </label>
                                    )}
                                </div>
                                <ObjectInspector
                                    object={selected}
                                    onChange={(patch) => {
                                        if (selectedId) onTransform(selectedId, patch);
                                    }}
                                    onDuplicate={duplicate}
                                    onDelete={remove}
                                    textures={textures}
                                    allowInteractions={kind !== "mesh"}
                                />
                            </>
                        ) : (
                            <div className="changes-panel">
                                <span className="eyebrow">SINCE VERSION {published.version}</span>
                                <h3>{changeCount ? "A new perspective." : "Everything is in place."}</h3>
                                <p>
                                    {changeCount
                                        ? `${changeCount} changes ready for your review.`
                                        : "Your workspace matches the last published version."}
                                </p>
                                {metadataChanged && (
                                    <div className="change-item">
                                        <span className="change-mark modified">~</span>
                                        <div>
                                            <strong>Workspace details</strong>
                                            <small>Name, description, or category</small>
                                        </div>
                                    </div>
                                )}
                                {paginate(changes, { page: changePage, size: 20 }).content.map((change) => (
                                    <div className="change-item" key={change.id}>
                                        <span className={`change-mark ${change.change.toLowerCase()}`}>
                                            {change.change === "Added" ? "+" : change.change === "Removed" ? "−" : "~"}
                                        </span>
                                        <div>
                                            <strong>{change.name}</strong>
                                            <small>
                                                {change.change} · {change.detail}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                                <Pagination
                                    data={paginate(changes, { page: changePage, size: 20 })}
                                    onPage={setChangePage}
                                    label="Changes"
                                />
                                {!!changeCount && (
                                    <button
                                        className="button secondary full-width"
                                        disabled={busy}
                                        onClick={() => void discard()}
                                    >
                                        Discard all changes
                                    </button>
                                )}
                                <div className="commit-note">
                                    <Check size={17} />
                                    <p>
                                        {kind === "mesh"
                                            ? "Committing exports a GLB and adds this version to your reusable mesh library."
                                            : "Publishing replaces the live version. Saved drafts remain private until you publish."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
            <input
                ref={input}
                type="file"
                multiple
                accept=".obj,.png,.jpg,.jpeg,.webp"
                aria-label="Import OBJ models and textures"
                className="hidden-input"
                onChange={(e) => void importFiles(Array.from(e.target.files || []))}
            />
            <input
                ref={textureInput}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                aria-label="Import textures"
                className="hidden-input"
                onChange={(e) => void importFiles(Array.from(e.target.files || []))}
            />
            {dragging && (
                <div className="file-drop-overlay">
                    <Upload size={50} />
                    <h2>Drop it into your world.</h2>
                    <p>OBJ models & image textures</p>
                </div>
            )}
            <ProductHover
                hover={hover}
                onMore={(id) => {
                    hover.close();
                    setDetailProduct(id);
                }}
            />
            {detailProduct && <ProductModal id={detailProduct} onClose={() => setDetailProduct(undefined)} />}
            {commitOpen && (
                <Modal
                    title={kind === "mesh" ? "Commit a new mesh version" : "Publish this space"}
                    onClose={() => {
                        if (!busy) setCommitOpen(false);
                    }}
                >
                    <p className="muted">
                        {content.name} · version {content.version + 1}
                    </p>
                    <div className="commit-summary">
                        <span>
                            <strong>{objects.length}</strong>objects
                        </span>
                        <span>
                            <strong>{changeCount}</strong>changes
                        </span>
                        <span>
                            <strong>{kind === "mesh" ? "GLB" : "Live"}</strong>
                            {kind === "mesh" ? "export format" : "visibility"}
                        </span>
                    </div>
                    <p>
                        {kind === "mesh"
                            ? "Your models, transformations, and textures will be exported together and saved as a reusable asset."
                            : "This publishes your current draft. Visitors will see the new version when they reload the space."}
                    </p>
                    {isMockMode && <Notice>This is a local development commit. No cloud upload is performed.</Notice>}
                    <button className="button primary full-width" disabled={busy} onClick={() => void commit()}>
                        {busy ? "Committing…" : kind === "mesh" ? "Commit version" : "Publish version"}
                        <Check size={16} />
                    </button>
                </Modal>
            )}
            {blocker.state === "blocked" && (
                <Modal title="Leave your unsaved changes?" onClose={() => blocker.reset()}>
                    <p>
                        Your edits haven’t been saved. Stay in the workspace to save them, or leave and discard the
                        unsaved edits.
                    </p>
                    <div className="modal-actions">
                        <button className="button secondary" onClick={() => blocker.reset()}>
                            Keep editing
                        </button>
                        <button className="button danger" onClick={() => blocker.proceed()}>
                            Leave workspace
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
