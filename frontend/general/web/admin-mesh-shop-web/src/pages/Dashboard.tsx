import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Box, Clock3, Globe2, Plus, Search, UsersRound } from "lucide-react";
import { ErrorState, Loading, ObjectArtwork, Pagination, services, useAsync } from "@mesh-shop/shared";
import CreateSpaceModal from "../components/CreateSpaceModal";

export default function Dashboard() {
    const [create, setCreate] = useState(false),
        [search, setSearch] = useState(""),
        [page, setPage] = useState(0);
    const { data, loading, error, reload } = useAsync(async () => {
        const [scenes, meshes, published, approved, pending] = await Promise.all([
            services.game.findPage({ page, size: 6, search }),
            services.mesh.findPage({ size: 3 }),
            services.game.findPage({ status: "PUBLISHED", size: 1 }),
            services.game.findMerchants({ status: "APPROVED", size: 1 }),
            services.game.findMerchants({ status: "PENDING", size: 1 }),
        ]);
        return {
            scenes,
            meshes,
            published: published.totalElements,
            approved: approved.totalElements,
            pending: pending.totalElements,
        };
    }, [page, search]);
    if (loading && !data) return <Loading label="Opening your workspace…" />;
    if (error || !data) return <ErrorState error={error} onRetry={reload} />;
    const stats = [
        {
            label: "Published spaces",
            value: data.published,
            icon: Globe2,
            note: "Ready to explore",
            link: "/game/maps/0",
        },
        {
            label: "Mesh assets",
            value: data.meshes.totalElements,
            icon: Box,
            note: "Made to be reused",
            link: "/meshes",
        },
        {
            label: "Active merchants",
            value: data.approved,
            icon: UsersRound,
            note: "Part of the district",
            link: "/merchants",
        },
        {
            label: "Awaiting approval",
            value: data.pending,
            icon: Clock3,
            note: "Merchant applications",
            link: "/merchants",
        },
    ];
    const scenes = data.scenes.content;
    return (
        <main className="dashboard page-content">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">YOUR WORKSPACE, AT A GLANCE</span>
                    <h1>Make room for what’s next.</h1>
                    <p>Great spaces start with the details. Let’s build something worth exploring.</p>
                </div>
                <button className="button primary" onClick={() => setCreate(true)}>
                    <Plus size={17} />
                    Create a space
                </button>
            </div>
            <div className="stats-grid">
                {stats.map((stat) => (
                    <Link to={stat.link} className="stat-card" key={stat.label}>
                        <div>
                            <span>{stat.label}</span>
                            <stat.icon size={18} />
                        </div>
                        <strong>{stat.value.toString().padStart(2, "0")}</strong>
                        <small>
                            <span className="status-dot" />
                            {stat.note}
                            <ArrowUpRight size={14} />
                        </small>
                    </Link>
                ))}
            </div>
            <section className="dashboard-feature">
                <div>
                    <span className="eyebrow">YOUR WORLD IS TAKING SHAPE</span>
                    <h2>
                        A little space.
                        <br />A lot of possibility.
                    </h2>
                    <p>
                        Arrange objects, set the atmosphere, and give
                        <br />
                        every merchant a world of their own.
                    </p>
                    <Link className="button light" to="/game/spots/13">
                        Open the scene editor <ArrowUpRight size={16} />
                    </Link>
                </div>
                <div className="feature-art">
                    <ObjectArtwork type="BUILDING" color="#bfa88a" />
                    <span className="feature-coordinate">22.3193° N / 114.1694° E</span>
                </div>
                <div className="feature-caption">
                    <span className="status-dot" /> FORM & FIELD<span>SPOT 013</span>
                </div>
            </section>
            <section className="spaces-section">
                <div className="section-heading">
                    <div>
                        <h2>
                            Your spaces <span className="count-badge">{data.scenes.totalElements}</span>
                        </h2>
                        <p>A place for every perspective.</p>
                    </div>
                    <div className="search-input">
                        <Search size={15} />
                        <input
                            aria-label="Search spaces"
                            placeholder="Search spaces…"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                        />
                    </div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Space</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Objects</th>
                                <th>Version</th>
                                <th aria-label="Actions" />
                            </tr>
                        </thead>
                        <tbody>
                            {scenes.map((scene) => (
                                <tr key={`${scene.type}/${scene.id}`}>
                                    <td>
                                        <Link className="space-name" to={`/game/${scene.type}/${scene.id}`}>
                                            <span className="table-icon">
                                                <Globe2 size={17} />
                                            </span>
                                            <span>
                                                {scene.name}
                                                <small>{scene.uid}</small>
                                            </span>
                                        </Link>
                                    </td>
                                    <td>
                                        {scene.type === "maps"
                                            ? "World map"
                                            : scene.type === "spots"
                                              ? "Merchant spot"
                                              : "Interior room"}
                                    </td>
                                    <td>
                                        <span className={`status-pill ${scene.status.toLowerCase()}`}>
                                            <span className="status-dot" />
                                            {scene.status === "PUBLISHED" ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td>{scene.objectCount}</td>
                                    <td>v{scene.version}</td>
                                    <td>
                                        <Link
                                            className="icon-button"
                                            aria-label={`Edit ${scene.name}`}
                                            to={`/game/${scene.type}/${scene.id}`}
                                        >
                                            <ArrowUpRight size={17} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!scenes.length && <p className="empty-copy">No spaces match your search.</p>}
                </div>
                <Pagination data={data.scenes} onPage={setPage} label="Spaces" busy={loading} />
            </section>
            <section className="recent-assets">
                <div className="section-heading">
                    <div>
                        <h2>From your mesh library</h2>
                        <p>Small details. Endless possibilities.</p>
                    </div>
                    <Link className="text-button" to="/meshes">
                        View library <ArrowRight size={15} />
                    </Link>
                </div>
                <div className="asset-mini-grid">
                    {data.meshes.content.map((mesh) => (
                        <Link to={`/meshes/${mesh.id}`} key={mesh.id} className="asset-mini">
                            <ObjectArtwork type={mesh.previewType} color={mesh.previewColor} />
                            <div>
                                <h3>{mesh.name}</h3>
                                <span>
                                    {mesh.category} · v{mesh.version}
                                </span>
                            </div>
                            <ArrowUpRight size={18} />
                        </Link>
                    ))}
                </div>
            </section>
            {create && <CreateSpaceModal onClose={() => setCreate(false)} />}
        </main>
    );
}
