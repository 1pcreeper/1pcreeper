import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowUpRight,
    Box,
    ChevronRight,
    Compass,
    Footprints,
    Layers3,
    MapPin,
    Maximize,
    RotateCcw,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import {
    Brand,
    ErrorState,
    Loading,
    Notice,
    ProductModal,
    ProductHover,
    useProductHover,
    Pagination,
    useSceneChunks,
    SceneCanvas,
    services,
    useAsync,
    type DimensionType,
    type SceneObjectDTO,
    type Vector3DTO,
} from "@mesh-shop/shared";

export default function Explorer({ type }: { type: DimensionType }) {
    const { id = "0" } = useParams(),
        navigate = useNavigate(),
        [params, setParams] = useSearchParams();
    const location = useLocation();
    const [perspective, setPerspective] = useState<"orbit" | "first">(() => {
        try {
            return sessionStorage.getItem("mesh-view-mode") === "first" ? "first" : "orbit";
        } catch {
            return "orbit";
        }
    });
    const [resetKey, setResetKey] = useState(0),
        [search, setSearch] = useState(""),
        [directoryPage, setDirectoryPage] = useState(0),
        [sidebar, setSidebar] = useState(true),
        [grid, setGrid] = useState(false),
        [notice, setNotice] = useState("");
    const viewport = useRef<HTMLDivElement>(null);
    const hover = useProductHover();
    const resource = useAsync(() => services.game.findById(type, id), [type, id]);
    const scene = resource.data;
    const chunks = useSceneChunks(scene);
    const spawn = (location.state as { spawn?: { position: Vector3DTO; yaw: number } } | null)?.spawn;
    useEffect(() => {
        try {
            sessionStorage.setItem("mesh-view-mode", perspective);
        } catch {
            /* View still persists between routes. */
        }
    }, [perspective]);
    useEffect(() => {
        setSearch("");
        setNotice("");
        hover.close();
    }, [type, id]);
    useEffect(() => {
        setDirectoryPage(0);
    }, [search, chunks.center.x, chunks.center.z, type, id]);
    const directory = useAsync(
        async () =>
            scene
                ? services.game.findChunk(
                      { type, id, ...chunks.center, snapshotVersion: scene.version, interactiveOnly: true },
                      { page: directoryPage, size: 10, search },
                  )
                : undefined,
        [scene?.version, type, id, chunks.center.x, chunks.center.z, search, directoryPage, Boolean(scene)],
    );
    const activate = useCallback(
        (object: SceneObjectDTO) => {
            const interaction = object.interaction;
            if (interaction?.type === "PRODUCT") hover.show(object);
            else if (interaction?.type === "TELEPORT") {
                const destination = interaction.destination;
                hover.close();
                navigate(`/game/${destination.type}/${destination.id}`, {
                    state: { spawn: { position: destination.position, yaw: destination.yaw } },
                });
            }
        },
        [navigate, hover.show, hover.close],
    );
    const entries = directory.data?.content || [];
    const movement = (code: string, down: boolean) =>
        window.dispatchEvent(new CustomEvent("mesh-movement", { detail: { code, down } }));
    return (
        <div className="explorer-app">
            <header className="explorer-header">
                <Brand />
                <div className="breadcrumbs">
                    <Link to="/game/maps/0">The district</Link>
                    {type !== "maps" && (
                        <>
                            <ChevronRight size={13} />
                            <span>{scene?.name || "Your space"}</span>
                        </>
                    )}
                </div>
                <Link className="text-button" to="/home">
                    <ArrowLeft size={15} />
                    <span>Back to discovery</span>
                </Link>
            </header>
            <div className="explorer-body">
                {sidebar && (
                    <aside className="explorer-sidebar">
                        <div className="panel-heading">
                            <span className="eyebrow">
                                {type === "maps" ? "EXPLORE THE NEIGHBOURHOOD" : "INSIDE THE SPACE"}
                            </span>
                            <button
                                className="icon-button mobile-only"
                                aria-label="Close directory"
                                onClick={() => setSidebar(false)}
                            >
                                <X size={17} />
                            </button>
                        </div>
                        <h1>{scene?.name || "Opening your space…"}</h1>
                        <p>
                            {type === "maps"
                                ? "Independent makers. Thoughtful objects. Discover what’s around the corner."
                                : "Take a look around. Every object has a story."}
                        </p>
                        <div className="search-input">
                            <Search size={16} />
                            <input
                                aria-label="Search spaces and objects"
                                placeholder={type === "maps" ? "Find a space…" : "Find an object…"}
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        <div className="list-label">
                            <span>{type === "maps" ? "NEARBY SPACES" : "OBJECTS & ROOMS"}</span>
                            <span>{(directory.data?.totalElements || 0).toString().padStart(2, "0")}</span>
                        </div>
                        <div className="explorer-directory">
                            {entries.map((item, index) => (
                                <button className="directory-item" key={item.id} onClick={() => activate(item)}>
                                    <span className={`directory-icon directory-color-${index % 3}`}>
                                        {item.interaction?.type === "TELEPORT" ? (
                                            <MapPin size={20} />
                                        ) : (
                                            <Box size={20} />
                                        )}
                                    </span>
                                    <span>
                                        <strong>{item.name}</strong>
                                        <small>
                                            {item.interaction?.type === "TELEPORT"
                                                ? item.interaction.destination.type === "places"
                                                    ? "Enter the room"
                                                    : "Visit the space"
                                                : "View object details"}
                                        </small>
                                    </span>
                                    <ArrowUpRight size={16} />
                                </button>
                            ))}
                            {!entries.length && (
                                <p className="empty-copy">
                                    No matches in this part of the district. Try another search or pan the map.
                                </p>
                            )}
                        </div>
                        {directory.error && <Notice error>{directory.error}</Notice>}
                        {directory.data && (
                            <Pagination data={directory.data} onPage={setDirectoryPage} busy={directory.loading} />
                        )}
                        <div className="sidebar-note">
                            <span className="status-dot" />
                            <span>
                                {type === "maps"
                                    ? "A neighbourhood, always evolving."
                                    : "Explore now. Shopping comes later."}
                            </span>
                        </div>
                        {scene?.parent && (
                            <Link className="button secondary" to={`/game/${scene.parent.type}/${scene.parent.id}`}>
                                <ArrowLeft size={15} />
                                Leave this space
                            </Link>
                        )}
                    </aside>
                )}
                <div className="explorer-viewport" ref={viewport}>
                    {resource.loading ? (
                        <Loading />
                    ) : resource.error ? (
                        <ErrorState error={resource.error} onRetry={resource.reload} />
                    ) : (
                        scene && (
                            <SceneCanvas
                                key={`${type}/${id}`}
                                objects={chunks.objects}
                                chunked
                                chunkCenter={chunks.center}
                                spawn={spawn}
                                paused={Boolean(params.get("productId"))}
                                onHover={hover.onHover}
                                variant={type === "maps" ? "map" : "room"}
                                perspective={perspective}
                                grid={grid}
                                resetKey={resetKey}
                                onActivate={activate}
                                onChunk={chunks.onChunk}
                                onError={setNotice}
                            />
                        )
                    )}
                    {perspective === "first" && (
                        <div className="first-person-overlay" aria-hidden="true">
                            <div className="crosshair">+</div>
                            <span className="first-help">
                                Click or drag to look · WASD to walk · Space to jump · Esc to release
                            </span>
                        </div>
                    )}
                    <div className="explorer-toolbar">
                        <button
                            className="tool-button"
                            aria-label="Toggle directory"
                            title="Toggle directory"
                            onClick={() => setSidebar(!sidebar)}
                        >
                            <SlidersHorizontal size={17} />
                        </button>
                        <div className="segmented">
                            <button
                                className={perspective === "orbit" ? "active" : ""}
                                onClick={() => setPerspective("orbit")}
                            >
                                <Compass size={16} />
                                Spectator
                            </button>
                            <button
                                className={perspective === "first" ? "active" : ""}
                                onClick={() => setPerspective("first")}
                            >
                                <Footprints size={16} />
                                First person
                            </button>
                        </div>
                        <div className="viewport-tools">
                            <button
                                aria-label="Toggle grid"
                                className={`tool-button ${grid ? "active" : ""}`}
                                onClick={() => setGrid(!grid)}
                            >
                                <Layers3 size={17} />
                            </button>
                            <button
                                aria-label="Reset camera"
                                className="tool-button"
                                onClick={() => setResetKey((value) => value + 1)}
                            >
                                <RotateCcw size={17} />
                            </button>
                            <button
                                aria-label="Toggle full screen"
                                className="tool-button"
                                onClick={() => {
                                    if (document.fullscreenElement) void document.exitFullscreen();
                                    else
                                        void viewport.current
                                            ?.requestFullscreen()
                                            .catch(() => setNotice("Full screen is unavailable in this browser."));
                                }}
                            >
                                <Maximize size={17} />
                            </button>
                        </div>
                    </div>
                    <div className="location-badge">
                        <span className="status-dot" />
                        <span>{scene?.name || "Mesh District"}</span>
                        <span>{chunks.loading ? "LOADING NEARBY…" : "LIVE SPACE"}</span>
                    </div>
                    {(notice || chunks.error) && (
                        <div className="viewport-notice">
                            <Notice error>{notice || chunks.error}</Notice>
                            {chunks.error && (
                                <button
                                    className="button secondary"
                                    onClick={() => {
                                        resource.reload();
                                        chunks.reload();
                                    }}
                                >
                                    Retry loading
                                </button>
                            )}
                        </div>
                    )}
                    {perspective === "first" && (
                        <div className="touch-navigation" aria-label="Movement controls">
                            {[
                                ["KeyW", "↑"],
                                ["KeyA", "←"],
                                ["KeyS", "↓"],
                                ["KeyD", "→"],
                                ["Space", "Jump"],
                            ].map(([code, label]) => (
                                <button
                                    key={code}
                                    aria-label={code === "Space" ? "Jump" : `Move ${code.slice(3)}`}
                                    onPointerDown={(e) => {
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        movement(code, true);
                                    }}
                                    onPointerUp={() => movement(code, false)}
                                    onPointerCancel={() => movement(code, false)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="explorer-bottom">
                        <span>
                            <span className="keycap">{perspective === "orbit" ? "↔" : "WASD"}</span>
                            {perspective === "orbit" ? "Drag to orbit" : "Walk around"}
                            <i />
                            <span className="keycap">{perspective === "orbit" ? "⌕" : "ESC"}</span>
                            {perspective === "orbit" ? "Scroll to zoom" : "Release cursor"}
                            <i />
                            Click an object to explore
                        </span>
                        {scene && (
                            <span className="coordinates">
                                {Math.abs(scene.latitude).toFixed(4)}° {scene.latitude >= 0 ? "N" : "S"} ·{" "}
                                {Math.abs(scene.longitude).toFixed(4)}° {scene.longitude >= 0 ? "E" : "W"}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <ProductHover
                hover={hover}
                onMore={(id) => {
                    hover.close();
                    setParams({ productId: id }, { state: location.state });
                }}
            />
            {params.get("productId") && (
                <ProductModal
                    id={params.get("productId")!}
                    onClose={() => {
                        const next = new URLSearchParams(params);
                        next.delete("productId");
                        setParams(next, { state: location.state });
                    }}
                />
            )}
        </div>
    );
}
