import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { ProductResponseDTO, SceneObjectDTO } from "../../models/dto/mesh.dto";
import { createObject } from "../../mock/world";
import { services } from "../../services/ServiceContainer";
import { useAsync } from "../../hooks/useAsync";
import SceneCanvas from "../scene/SceneCanvas";
import { Notice } from "./UI";

export function ProductPreview({ product }: { product: ProductResponseDTO }) {
    const [error, setError] = useState("");
    const objects = useMemo(
        () => [
            {
                ...createObject(product.type, product.name, [0, 0, 0], product.color),
                assetId: product.assetId,
                assetVersionId: product.assetVersionId,
            },
        ],
        [product.id, product.assetId, product.assetVersionId, product.color],
    );
    return error ? (
        <Notice error>{error}</Notice>
    ) : (
        <SceneCanvas objects={objects} variant="asset" autoRotate grid={false} onError={setError} />
    );
}
export function useProductHover() {
    const [id, setId] = useState<string>();
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const keep = useCallback(() => {
        clearTimeout(timer.current);
    }, []);
    const close = useCallback(() => {
        clearTimeout(timer.current);
        setId(undefined);
    }, []);
    const leave = useCallback(() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setId(undefined), 350);
    }, []);
    const showId = useCallback((value: string) => {
        clearTimeout(timer.current);
        setId(value);
    }, []);
    const show = useCallback(
        (object: SceneObjectDTO) => {
            if (object.interaction?.type === "PRODUCT") showId(object.interaction.productId);
        },
        [showId],
    );
    const onHover = useCallback(
        (object?: SceneObjectDTO) => {
            if (object) show(object);
            else leave();
        },
        [show, leave],
    );
    useEffect(() => () => clearTimeout(timer.current), []);
    return { id, keep, close, leave, show, showId, onHover };
}
export function ProductHover({
    hover,
    onMore,
}: {
    hover: ReturnType<typeof useProductHover>;
    onMore: (id: string) => void;
}) {
    return hover.id ? <HoverCard key={hover.id} id={hover.id} hover={hover} onMore={onMore} /> : null;
}
function HoverCard({
    id,
    hover,
    onMore,
}: {
    id: string;
    hover: ReturnType<typeof useProductHover>;
    onMore: (id: string) => void;
}) {
    const { data, error, loading } = useAsync(() => services.game.findProduct(id), [id]);
    useEffect(() => {
        const escape = (e: KeyboardEvent) => {
            if (e.key === "Escape") hover.close();
        };
        window.addEventListener("keydown", escape);
        return () => window.removeEventListener("keydown", escape);
    }, [hover.close]);
    return (
        <aside
            className="product-hover"
            role="dialog"
            aria-label="Product preview"
            onPointerEnter={hover.keep}
            onPointerLeave={hover.leave}
            onFocus={hover.keep}
        >
            <button className="icon-button hover-close" aria-label="Close product preview" onClick={hover.close}>
                <X size={16} />
            </button>
            {loading && <p>Loading object…</p>}
            {error && <Notice error>{error}</Notice>}
            {data && (
                <>
                    <div className="hover-model">
                        <ProductPreview product={data} />
                    </div>
                    <div className="hover-copy">
                        <small>{data.merchant}</small>
                        <h3>{data.name}</h3>
                        <p>
                            {new Intl.NumberFormat("en-HK", { style: "currency", currency: data.currency }).format(
                                data.price,
                            )}
                        </p>
                        <button className="button primary full-width" onClick={() => onMore(id)}>
                            See More
                        </button>
                    </div>
                </>
            )}
        </aside>
    );
}
