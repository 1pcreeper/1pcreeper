import { ProductPreview } from "./ProductHover";
import { ArrowUpRight, Ruler, Layers3 } from "lucide-react";
import { services } from "../../services/ServiceContainer";
import { useAsync } from "../../hooks/useAsync";
import { Loading, Modal, Notice } from "./UI";

export default function ProductModal({ id, onClose }: { id: string; onClose: () => void }) {
    const { data, error, loading } = useAsync(() => services.game.findProduct(id), [id]);
    return (
        <Modal title="Object details" onClose={onClose} fullScreen>
            {loading ? (
                <Loading label="Finding this object…" />
            ) : error ? (
                <Notice error>{error}</Notice>
            ) : (
                data && (
                    <div className="product-detail">
                        <div className="product-image">
                            <ProductPreview product={data} />
                            <span className="pill">DESIGN NO. {data.id}</span>
                        </div>
                        <div className="product-copy">
                            <span className="eyebrow">
                                {data.merchant} <ArrowUpRight size={12} />
                            </span>
                            <h2>{data.name}</h2>
                            <p className="product-price">
                                {new Intl.NumberFormat("en-HK", {
                                    style: "currency",
                                    currency: data.currency,
                                    maximumFractionDigits: 0,
                                }).format(data.price)}{" "}
                                <span>{data.currency}</span>
                            </p>
                            <p>{data.description}</p>
                            <div className="product-spec">
                                <Layers3 size={16} />
                                <span>{data.material}</span>
                            </div>
                            <div className="product-spec">
                                <Ruler size={16} />
                                <span>{data.dimensions}</span>
                            </div>
                            <div className="coming-note">
                                <span className="status-dot" /> Discover now. Shop soon.
                                <small>Purchasing is coming in a later release.</small>
                            </div>
                        </div>
                    </div>
                )
            )}
        </Modal>
    );
}
