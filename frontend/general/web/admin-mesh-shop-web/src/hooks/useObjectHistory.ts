import { useCallback, useState } from "react";
import type { SceneObjectDTO } from "@mesh-shop/shared";
export function useObjectHistory(initial: SceneObjectDTO[]) {
    const [history, setHistory] = useState({
        past: [] as SceneObjectDTO[][],
        present: initial,
        future: [] as SceneObjectDTO[][],
    });
    const update = useCallback(
        (change: SceneObjectDTO[] | ((objects: SceneObjectDTO[]) => SceneObjectDTO[])) =>
            setHistory((state) => {
                const next = typeof change === "function" ? change(state.present) : change;
                if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
                return { past: [...state.past.slice(-29), state.present], present: next, future: [] };
            }),
        [],
    );
    const undo = useCallback(
        () =>
            setHistory((state) =>
                state.past.length
                    ? {
                          past: state.past.slice(0, -1),
                          present: state.past.at(-1)!,
                          future: [state.present, ...state.future],
                      }
                    : state,
            ),
        [],
    );
    const redo = useCallback(
        () =>
            setHistory((state) =>
                state.future.length
                    ? { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1) }
                    : state,
            ),
        [],
    );
    const reset = useCallback(
        (objects: SceneObjectDTO[]) => setHistory({ past: [], present: objects, future: [] }),
        [],
    );
    const mergeRemote = useCallback(
        (incoming: SceneObjectDTO[]) =>
            setHistory((state) => ({
                past: state.past.map((snapshot) => [...snapshot, ...incoming]),
                present: [...state.present, ...incoming],
                future: state.future.map((snapshot) => [...snapshot, ...incoming]),
            })),
        [],
    );
    return {
        mergeRemote,
        objects: history.present,
        update,
        undo,
        redo,
        reset,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
    };
}
