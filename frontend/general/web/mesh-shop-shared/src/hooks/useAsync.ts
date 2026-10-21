import { useEffect, useState, type DependencyList } from "react";

export function useAsync<T>(load: () => Promise<T>, dependencies: DependencyList) {
    const [data, setData] = useState<T>();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        setData(undefined);
        load()
            .then((value) => {
                if (active) setData(value);
            })
            .catch((error) => {
                if (active) setError(error instanceof Error ? error.message : "Something went wrong.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
        // Dependencies are supplied explicitly by the consumer.
    }, [...dependencies, revision]);
    return { data, error, loading, reload: () => setRevision((value) => value + 1), setData };
}
