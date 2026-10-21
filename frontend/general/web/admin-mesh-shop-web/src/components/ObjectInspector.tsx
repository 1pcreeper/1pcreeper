import { Box, Copy, Trash2 } from "lucide-react";
import { PagedSelect, services, type PageRequestDTO } from "@mesh-shop/shared";
import type {
    SceneObjectDTO,
    SceneResponseDTO,
    TextureResponseDTO,
    ProductResponseDTO,
    Vector3DTO,
} from "@mesh-shop/shared";

export default function ObjectInspector({
    object,
    onChange,
    onDuplicate,
    onDelete,
    textures,
    allowInteractions = true,
}: {
    object?: SceneObjectDTO;
    onChange: (patch: Partial<SceneObjectDTO>) => void;
    onDuplicate: () => void;
    onDelete: () => void;
    textures: TextureResponseDTO[];
    allowInteractions?: boolean;
}) {
    if (!object)
        return (
            <div className="inspector-empty">
                <Box size={32} strokeWidth={1.2} />
                <h3>A little attention to detail.</h3>
                <p>Select an object in the scene or hierarchy to edit its properties.</p>
                <span>G · move &nbsp; R · rotate &nbsp; S · scale</span>
            </div>
        );
    const vector = (field: "position" | "rotation" | "scale", index: number, raw: string) => {
        if (raw === "") return;
        const value = Number(raw);
        if (!Number.isFinite(value) || (field === "scale" && value < 0.01)) return;
        const next = [...object[field]] as Vector3DTO;
        next[index] = field === "rotation" ? (value * Math.PI) / 180 : value;
        onChange({ [field]: next });
    };
    return (
        <div className="inspector-fields">
            <div className="selected-object-title">
                <span className="small-cube">
                    <Box size={19} />
                </span>
                <div>
                    <strong>{object.name}</strong>
                    <small>{object.type} OBJECT</small>
                </div>
            </div>
            <label>
                Object name
                <input value={object.name} maxLength={120} onChange={(e) => onChange({ name: e.target.value })} />
            </label>
            <div className="inspector-section">
                <span className="field-title">TRANSFORM</span>
                {(["position", "rotation", "scale"] as const).map((field) => (
                    <div className="vector-field" key={field}>
                        <span>
                            {field[0].toUpperCase() + field.slice(1)}
                            {field === "rotation" && " °"}
                        </span>
                        <div>
                            {object[field].map((value, index) => (
                                <label key={index}>
                                    <span className={`axis-${index}`}>{["X", "Y", "Z"][index]}</span>
                                    <input
                                        type="number"
                                        aria-label={`${field} ${["X", "Y", "Z"][index]}`}
                                        step={field === "rotation" ? 5 : 0.1}
                                        min={field === "scale" ? 0.01 : undefined}
                                        value={Number(
                                            (field === "rotation" ? (value * 180) / Math.PI : value).toFixed(3),
                                        )}
                                        onChange={(event) => vector(field, index, event.target.value)}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="inspector-section">
                <span className="field-title">MATERIAL</span>
                <label className="color-field">
                    <span>Base color</span>
                    <input
                        type="color"
                        value={object.color}
                        onChange={(event) => onChange({ color: event.target.value, colorOverride: true })}
                    />
                    <code>{object.color}</code>
                </label>
                <PagedSelect
                    label="Texture"
                    value={object.textureId}
                    selectedLabel={textures.find((texture) => texture.id === object.textureId)?.name}
                    load={loadTextures}
                    onChange={(option) => onChange({ textureId: option?.id })}
                />
            </div>
            {object.type === "LIGHT" && (
                <div className="inspector-section">
                    <label>
                        Light intensity
                        <input
                            type="number"
                            min="0"
                            max="200"
                            step="1"
                            value={object.intensity ?? 15}
                            onChange={(e) =>
                                onChange({ intensity: Math.max(0, Math.min(200, Number(e.target.value))) })
                            }
                        />
                    </label>
                </div>
            )}
            {allowInteractions && (
                <div className="inspector-section">
                    <span className="field-title">SPACE INTERACTION</span>
                    <p className="muted">Behavior belongs to this placed instance only.</p>
                    <label>
                        Interaction type
                        <select
                            aria-label="Interaction type"
                            value={object.interaction?.type || "NONE"}
                            onChange={(event) =>
                                onChange({
                                    productId: undefined,
                                    target: undefined,
                                    interaction:
                                        event.target.value === "PRODUCT"
                                            ? { type: "PRODUCT", productId: "" }
                                            : event.target.value === "TELEPORT"
                                              ? {
                                                    type: "TELEPORT",
                                                    destination: { type: "spots", id: "", position: [0, 0, 4], yaw: 0 },
                                                }
                                              : undefined,
                                })
                            }
                        >
                            <option value="NONE">Decoration / no interaction</option>
                            <option value="PRODUCT">A · Product preview</option>
                            <option value="TELEPORT">B · Teleport to a space</option>
                        </select>
                    </label>
                    {object.interaction?.type === "PRODUCT" && (
                        <PagedSelect
                            label="Product"
                            value={object.interaction.productId}
                            load={loadProducts}
                            onChange={(option) =>
                                onChange({
                                    interaction: option ? { type: "PRODUCT", productId: option.id } : undefined,
                                })
                            }
                        />
                    )}
                    {object.interaction?.type === "TELEPORT" && (
                        <>
                            <PagedSelect
                                label="Destination space"
                                value={
                                    object.interaction.destination.id
                                        ? `${object.interaction.destination.type}/${object.interaction.destination.id}`
                                        : ""
                                }
                                load={loadSpaces}
                                onChange={(option) => {
                                    if (!option) {
                                        onChange({ interaction: undefined });
                                        return;
                                    }
                                    if (object.interaction?.type !== "TELEPORT") return;
                                    const [type, id] = option.id.split("/");
                                    onChange({
                                        interaction: {
                                            type: "TELEPORT",
                                            destination: {
                                                ...object.interaction.destination,
                                                type: type as SceneResponseDTO["type"],
                                                id,
                                            },
                                        },
                                    });
                                }}
                            />
                            <div className="vector-field">
                                <span>Arrival position · metres</span>
                                <div>
                                    {object.interaction.destination.position.map((value, index) => (
                                        <label key={index}>
                                            <span>{["X", "Y", "Z"][index]}</span>
                                            <input
                                                type="number"
                                                aria-label={`Arrival ${["X", "Y", "Z"][index]}`}
                                                step="0.1"
                                                value={value}
                                                onChange={(event) => {
                                                    if (
                                                        object.interaction?.type !== "TELEPORT" ||
                                                        !Number.isFinite(Number(event.target.value))
                                                    )
                                                        return;
                                                    const position = [
                                                        ...object.interaction.destination.position,
                                                    ] as Vector3DTO;
                                                    position[index] = Number(event.target.value);
                                                    onChange({
                                                        interaction: {
                                                            type: "TELEPORT",
                                                            destination: {
                                                                ...object.interaction.destination,
                                                                position,
                                                            },
                                                        },
                                                    });
                                                }}
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <label>
                                Arrival facing · degrees
                                <input
                                    type="number"
                                    aria-label="Arrival facing"
                                    value={Math.round((object.interaction.destination.yaw * 180) / Math.PI)}
                                    onChange={(event) => {
                                        if (
                                            object.interaction?.type === "TELEPORT" &&
                                            Number.isFinite(Number(event.target.value))
                                        )
                                            onChange({
                                                interaction: {
                                                    type: "TELEPORT",
                                                    destination: {
                                                        ...object.interaction.destination,
                                                        yaw: (Number(event.target.value) * Math.PI) / 180,
                                                    },
                                                },
                                            });
                                    }}
                                />
                            </label>
                        </>
                    )}
                    {object.type === "BUILDING" && (
                        <div className="two-fields">
                            <label>
                                Longitude
                                <input
                                    type="number"
                                    step=".00001"
                                    min="-180"
                                    max="180"
                                    value={object.longitude ?? 114.1694}
                                    onChange={(e) =>
                                        onChange({ longitude: Math.max(-180, Math.min(180, Number(e.target.value))) })
                                    }
                                />
                            </label>
                            <label>
                                Latitude
                                <input
                                    type="number"
                                    step=".00001"
                                    min="-90"
                                    max="90"
                                    value={object.latitude ?? 22.3193}
                                    onChange={(e) =>
                                        onChange({ latitude: Math.max(-90, Math.min(90, Number(e.target.value))) })
                                    }
                                />
                            </label>
                        </div>
                    )}
                </div>
            )}
            <div className="object-actions">
                <button className="button secondary" onClick={onDuplicate}>
                    <Copy size={14} />
                    Duplicate
                </button>
                <button className="button danger" onClick={onDelete}>
                    <Trash2 size={14} />
                    Delete
                </button>
            </div>
        </div>
    );
}

const loadTextures = (query: PageRequestDTO) => services.mesh.findTextures(query);
const loadProducts = (query: PageRequestDTO) => services.game.findProducts(query);
const loadSpaces = async (query: PageRequestDTO) => {
    const result = await services.game.findPage(query);
    return {
        ...result,
        content: result.content.map((scene) => ({
            id: `${scene.type}/${scene.id}`,
            name: scene.name,
            detail: `${scene.type} · #${scene.id}`,
        })),
    };
};
