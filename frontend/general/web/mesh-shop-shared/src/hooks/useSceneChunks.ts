import { useCallback, useEffect, useRef, useState } from "react";
import { services } from "../services/ServiceContainer";
import type { SceneObjectDTO, SceneResponseDTO } from "../models/dto/mesh.dto";
import { withinChunks, type ChunkLocation } from "../services/content/ChunkService";
export function useSceneChunks(scene?: SceneResponseDTO, draft = false) {
    const [center, setCenter] = useState<ChunkLocation>({ x: 0, z: 0 }),
        [objects, setObjects] = useState<SceneObjectDTO[]>([]),
        [loading, setLoading] = useState(false),
        [error, setError] = useState(""),
        [revision, setRevision] = useState(0);
    const cache = useRef(new Map<string, SceneObjectDTO>());
    const identity = scene ? `${scene.type}/${scene.id}/${scene.version}` : "";
    useEffect(() => {
        cache.current.clear();
        setObjects([]);
        setCenter({ x: 0, z: 0 });
    }, [identity]);
    useEffect(() => {
        if (!scene) return;
        const controller = new AbortController();
        setLoading(true);
        setError("");
        services.game
            .loadNearby(
                {
                    type: scene.type,
                    id: scene.id,
                    ...center,
                    draft,
                    snapshotVersion: scene.version,
                    draftRevision: scene.draftRevision,
                },
                controller.signal,
            )
            .then((incoming) => {
                if (controller.signal.aborted) return;
                // Replace authoritative current cells; retain distant cells invisibly for smooth returns.
                for (const [id, object] of cache.current) if (withinChunks(object, center)) cache.current.delete(id);
                for (const object of incoming) {
                    cache.current.delete(object.id);
                    cache.current.set(object.id, object);
                }
                for (const [id, object] of cache.current) {
                    if (cache.current.size <= Math.max(512, incoming.length)) break;
                    if (!withinChunks(object, center)) cache.current.delete(id);
                }
                setObjects([...cache.current.values()]);
            })
            .catch((error) => {
                if (!controller.signal.aborted) setError(error.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [identity, center.x, center.z, draft, revision]);
    const onChunk = useCallback(
        (x: number, z: number) => setCenter((previous) => (previous.x === x && previous.z === z ? previous : { x, z })),
        [],
    );
    return { objects, center, onChunk, loading, error, reload: () => setRevision((value) => value + 1) };
}
