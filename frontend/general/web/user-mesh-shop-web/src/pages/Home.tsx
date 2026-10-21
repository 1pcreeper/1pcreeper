import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, Box, Compass, Move3d, Scan } from "lucide-react";
import {
    Brand,
    createObject,
    ErrorState,
    Loading,
    ObjectArtwork,
    ProductModal,
    ProductHover,
    useProductHover,
    Pagination,
    SceneCanvas,
    services,
    useAsync,
} from "@mesh-shop/shared";
import Header from "../components/Header";

export default function Home() {
    const [product, setProduct] = useState<string>();
    const hover = useProductHover();
    const [page, setPage] = useState(0);
    const {
        data: products,
        loading,
        error,
        reload,
    } = useAsync(() => services.game.findProducts({ page, size: 3 }), [page]);
    const objects = useMemo(
        () => [
            {
                ...createObject("GROUND", "Display plinth", [0, -0.3, 0], "#b7b19f"),
                scale: [7.4, 0.5, 6] as [number, number, number],
            },
            {
                ...createObject("CHAIR", "Arc lounge chair", [-1.55, 0, -0.7], "#d8be88"),
                rotation: [0, 0.45, 0] as [number, number, number],
                interaction: { type: "PRODUCT" as const, productId: "1234" },
            },
            {
                ...createObject("TABLE", "Pebble coffee table", [0.65, 0, 1], "#977453"),
                interaction: { type: "PRODUCT" as const, productId: "1236" },
            },
            {
                ...createObject("LAMP", "Orbit table light", [1.7, 0, -1.3], "#d87543"),
                scale: [1.6, 1.6, 1.6] as [number, number, number],
                interaction: { type: "PRODUCT" as const, productId: "1235" },
            },
            {
                ...createObject("PLANT", "Ficus", [-2.9, 0, -2], "#637b50"),
                scale: [1.3, 1.3, 1.3] as [number, number, number],
            },
        ],
        [],
    );
    return (
        <div className="visitor-app">
            <Header />
            <main>
                <section className="home-hero">
                    <div className="hero-copy">
                        <div className="eyebrow">
                            <span className="status-dot" /> INDEPENDENT DESIGN. A WORLD TO EXPLORE.
                        </div>
                        <h1>
                            Good design.
                            <br />A whole new
                            <br />
                            <em>dimension.</em>
                        </h1>
                        <p>
                            Step inside the shops. Get closer to the objects.
                            <br className="desktop-only" /> Discover a world of design, made to be explored.
                        </p>
                        <Link className="button primary large" to="/game/maps/0">
                            Enter the district <ArrowUpRight size={20} />
                        </Link>
                        <div className="hero-footnote">
                            <span>
                                <Compass size={15} /> Explore freely
                            </span>
                            <i />
                            No download. No sign-up.
                        </div>
                    </div>
                    <div className="hero-viewport">
                        <SceneCanvas
                            objects={objects}
                            variant="hero"
                            grid={false}
                            onActivate={hover.show}
                            onHover={hover.onHover}
                        />
                        <div className="viewport-topline">
                            <span>
                                <span className="status-dot" /> LIVE 3D EXPERIENCE
                            </span>
                            <Scan size={19} />
                        </div>
                        <div className="hero-annotation">
                            <span className="annotation-dot" />
                            <div>
                                <small>IN THE SPOTLIGHT</small>
                                <strong>Form & Field</strong>
                                <span>
                                    Objects for everyday living <ArrowUpRight size={12} />
                                </span>
                            </div>
                        </div>
                        <div className="viewport-bottomline">
                            <span>
                                <Move3d size={14} /> Drag to orbit · Scroll to get closer
                            </span>
                            <span>01 / 03</span>
                        </div>
                    </div>
                </section>
                <div className="marquee-strip">
                    <span>A DIFFERENT WAY TO DISCOVER</span>
                    <span>
                        <Box size={16} /> Real objects. New perspectives.
                    </span>
                    <span>CURATED SPACES / INDEPENDENT MAKERS</span>
                    <ArrowDown size={18} />
                </div>
                <section className="home-collections" id="collections">
                    <div className="section-heading">
                        <div>
                            <span className="eyebrow">WORTH A CLOSER LOOK</span>
                            <h2>Objects with a point of view.</h2>
                        </div>
                        <Link className="text-button" to="/game/spots/13">
                            Visit the collection <ArrowUpRight size={17} />
                        </Link>
                    </div>
                    {loading && <Loading label="Loading the collection…" />}
                    {error && <ErrorState error={error} onRetry={reload} />}
                    {!loading && !error && products?.totalElements === 0 && <p>The next collection is on its way.</p>}
                    <div className="product-cards">
                        {(products?.content || []).map((item, index) => (
                            <button
                                className="product-card"
                                key={item.id}
                                onPointerEnter={() => hover.showId(item.id)}
                                onPointerLeave={hover.leave}
                                onFocus={() => hover.showId(item.id)}
                                onClick={() => setProduct(item.id)}
                            >
                                <div className={`card-art card-art-${index}`}>
                                    <span className="art-index">
                                        0{index + 1} / {item.category.toUpperCase()}
                                    </span>
                                    <ObjectArtwork type={item.type} color={item.color} />
                                    <span className="round-arrow">
                                        <ArrowUpRight size={18} />
                                    </span>
                                </div>
                                <div className="card-caption">
                                    <div>
                                        <h3>{item.name}</h3>
                                        <p>{item.merchant}</p>
                                    </div>
                                    <span>HK${item.price.toLocaleString()}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    <Pagination data={products} onPage={setPage} label="Collection" busy={loading} />
                </section>
                <section className="discovery-section" id="about">
                    <div>
                        <span className="eyebrow">BEYOND THE PRODUCT GRID</span>
                        <h2>Take the scenic route.</h2>
                        <p>
                            Wander a neighbourhood of independent makers. Step into their spaces, turn an object around,
                            and find something you didn’t know you were looking for.
                        </p>
                        <Link className="text-button" to="/game/maps/0">
                            Find your next favourite <ArrowRight size={17} />
                        </Link>
                    </div>
                    <div className="discovery-options">
                        <Link to="/game/maps/0">
                            <span className="option-icon">
                                <Compass />
                            </span>
                            <div>
                                <h3>Explore in 3D</h3>
                                <p>A little curiosity goes a long way.</p>
                            </div>
                            <ArrowUpRight />
                        </Link>
                        <Link to="/shop">
                            <span className="option-icon">
                                <Box />
                            </span>
                            <div>
                                <h3>
                                    The classic shop <span className="tag">COMING SOON</span>
                                </h3>
                                <p>A familiar way to find extraordinary things.</p>
                            </div>
                            <ArrowUpRight />
                        </Link>
                    </div>
                </section>
            </main>
            <footer className="visitor-footer">
                <Brand />
                <span>Independent design. Connected spaces.</span>
                <a href={import.meta.env.VITE_ADMIN_APP_URL || "http://localhost:5174"}>
                    Open Mesh Studio <ArrowUpRight size={14} />
                </a>
                <small>© {new Date().getFullYear()} Mesh District</small>
            </footer>
            <ProductHover
                hover={hover}
                onMore={(id) => {
                    hover.close();
                    setProduct(id);
                }}
            />
            {product && <ProductModal id={product} onClose={() => setProduct(undefined)} />}
        </div>
    );
}
