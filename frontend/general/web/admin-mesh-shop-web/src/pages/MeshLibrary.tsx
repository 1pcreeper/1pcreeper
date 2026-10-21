import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import { ErrorState, Loading, ObjectArtwork, Pagination, services, useAsync } from "@mesh-shop/shared";
export default function MeshLibrary() {
    const [search, setSearch] = useState(""),
        [category, setCategory] = useState("All assets"),
        [page, setPage] = useState(0);
    const { data, loading, error, reload } = useAsync(
        () =>
            services.mesh.findPage({
                page,
                size: 12,
                search,
                category: category === "All assets" ? undefined : category,
            }),
        [page, search, category],
    );
    return (
        <main className="page-content">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">BUILD ON GOOD DESIGN</span>
                    <h1>Your mesh library.</h1>
                    <p>One object. A world of possibilities. Create, refine, and reuse your 3D assets.</p>
                </div>
                <Link className="button primary" to="/meshes/new">
                    <Plus size={17} />
                    Create mesh
                </Link>
            </div>
            <div className="library-toolbar">
                <div className="filter-tabs">
                    {["All assets", "Furniture", "Lighting", "Architecture", "Decoration", "Other"].map((item) => (
                        <button
                            className={category === item ? "active" : ""}
                            key={item}
                            onClick={() => {
                                setCategory(item);
                                setPage(0);
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <div className="search-input">
                    <Search size={16} />
                    <input
                        aria-label="Search meshes"
                        placeholder="Search meshes…"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(0);
                        }}
                    />
                </div>
            </div>
            {loading ? (
                <Loading />
            ) : error ? (
                <ErrorState error={error} onRetry={reload} />
            ) : (
                <div className="mesh-library-grid">
                    {data?.content.map((mesh, index) => (
                        <Link className="mesh-card" to={`/meshes/${mesh.id}`} key={mesh.id}>
                            <div className={`card-art card-art-${index % 3}`}>
                                <span className="tag">{mesh.previewType === "OBJ" ? "IMPORTED OBJ" : "3D ASSET"}</span>
                                <ObjectArtwork type={mesh.previewType} color={mesh.previewColor} />
                                <span className="round-arrow">
                                    <ArrowUpRight size={18} />
                                </span>
                            </div>
                            <div className="mesh-card-info">
                                <h3>{mesh.name}</h3>
                                <p>
                                    {mesh.category}
                                    <span>Version {mesh.version}</span>
                                </p>
                                <span className="status-pill published">
                                    <span className="status-dot" />
                                    Published
                                </span>
                            </div>
                        </Link>
                    ))}
                    <Link to="/meshes/new" className="new-mesh-card">
                        <span>
                            <Plus size={25} />
                        </span>
                        <h3>Make something new</h3>
                        <p>Import OBJ files or start with a primitive.</p>
                    </Link>
                </div>
            )}
            <Pagination data={data} onPage={setPage} busy={loading} label="Meshes" />
        </main>
    );
}
