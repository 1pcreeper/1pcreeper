import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    createObject,
    Modal,
    Notice,
    PagedSelect,
    services,
    type DimensionType,
    type SceneResponseDTO,
    type PageRequestDTO,
} from "@mesh-shop/shared";
const merchants = async (query: PageRequestDTO) => services.game.findMerchants({ ...query, status: "APPROVED" });
const spaces = async (query: PageRequestDTO) => {
    const page = await services.game.findPage(query);
    return {
        ...page,
        content: page.content.map((scene) => ({
            id: `${scene.type}/${scene.id}`,
            name: scene.name,
            detail: `${scene.type} · #${scene.id}`,
        })),
    };
};
export default function CreateSpaceModal({ onClose }: { onClose: () => void }) {
    const navigate = useNavigate(),
        [name, setName] = useState(""),
        [type, setType] = useState<DimensionType>("spots"),
        [merchantId, setMerchantId] = useState(""),
        [parent, setParent] = useState(""),
        [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            if (type !== "maps" && !merchantId) throw new Error("Choose an approved merchant.");
            const [parentType, parentId] = parent.split("/");
            const scene: SceneResponseDTO = {
                id: "",
                uid: "",
                name,
                type,
                merchantId: merchantId || undefined,
                description: "A new space to explore.",
                longitude: 114.1694,
                latitude: 22.3193,
                version: 0,
                status: "DRAFT",
                updatedAt: new Date().toISOString(),
                objects:
                    type === "maps"
                        ? []
                        : [{ ...createObject("GROUND", "Floor", [0, -0.1, 0], "#b9b3a6"), scale: [12, 0.2, 10] }],
                parent: parentId ? { type: parentType as DimensionType, id: parentId } : undefined,
            };
            const result = await services.game.create(scene);
            navigate(`/game/${result.type}/${result.id}`);
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBusy(false);
        }
    };
    return (
        <Modal title="Create a space" onClose={onClose}>
            <p className="muted">
                Create a separate world map, merchant spot, or interior room. New spaces begin as private drafts.
            </p>
            <form className="form-stack" onSubmit={submit}>
                <label>
                    Space name
                    <input
                        required
                        maxLength={120}
                        value={name}
                        placeholder="e.g. The Sunday Studio"
                        onChange={(event) => setName(event.target.value)}
                    />
                </label>
                <label>
                    Space type
                    <select value={type} onChange={(event) => setType(event.target.value as DimensionType)}>
                        <option value="maps">World map</option>
                        <option value="spots">Merchant spot</option>
                        <option value="places">Interior room</option>
                    </select>
                </label>
                <PagedSelect
                    label="Merchant"
                    value={merchantId}
                    load={merchants}
                    required={type !== "maps"}
                    onChange={(option) => setMerchantId(option?.id || "")}
                />
                <PagedSelect
                    label="Parent space"
                    value={parent}
                    load={spaces}
                    onChange={(option) => setParent(option?.id || "")}
                />
                <Notice>
                    Add any mesh instance to another space and give it a teleport interaction to connect this space.
                </Notice>
                {error && <Notice error>{error}</Notice>}
                <button className="button primary full-width" disabled={busy}>
                    {busy ? "Creating…" : "Create draft space"}
                </button>
            </form>
        </Modal>
    );
}
