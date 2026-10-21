import type { Plugin } from "vite";
import { readFile, writeFile, mkdir, rename, rmdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createInitialState } from "../src/mock/world";

// Development-only persistence bridge: both Vite applications share one local fixture file.
// No Java service, database, Docker, or cloud storage is started.
export function meshMockPlugin(): Plugin {
    const directory = fileURLToPath(new URL("../../.mesh-shop-runtime/", import.meta.url));
    const file = `${directory}world.json`;
    let queue = Promise.resolve();
    const read = async () => {
        try {
            return JSON.parse(await readFile(file, "utf8"));
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") return createInitialState();
            throw error;
        }
    };
    return {
        name: "mesh-local-fixtures",
        configureServer(server) {
            server.middlewares.use("/__mesh_mock/state", (req, res) => {
                const run = async () => {
                    res.setHeader("Content-Type", "application/json");
                    res.setHeader("Cache-Control", "no-store");
                    if (req.method === "GET") {
                        res.end(JSON.stringify({ success: true, message: "", data: await read() }));
                        return;
                    }
                    if (req.method !== "PUT") {
                        res.statusCode = 405;
                        res.end();
                        return;
                    }
                    // Prevent a different web origin from mutating the loopback fixture server.
                    if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) {
                        res.statusCode = 403;
                        res.end();
                        return;
                    }
                    let body = "";
                    for await (const chunk of req) {
                        body += chunk;
                        if (body.length > 40 * 1024 * 1024) throw new Error("Local fixture exceeds 40 MB.");
                    }
                    const next = JSON.parse(body);
                    await mkdir(directory, { recursive: true });
                    const lock = `${file}.lock`;
                    let acquired = false;
                    for (let attempt = 0; attempt < 100; attempt++) {
                        try {
                            await mkdir(lock);
                            acquired = true;
                            break;
                        } catch (error) {
                            if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
                            await new Promise((resolve) => setTimeout(resolve, 20));
                        }
                    }
                    if (!acquired) throw new Error("Local workspace is busy. Try again shortly.");
                    try {
                        const current = await read();
                        if (next.revision !== current.revision) {
                            res.statusCode = 409;
                            res.end(
                                JSON.stringify({
                                    success: false,
                                    message: "The workspace changed in another tab. Reload and try again.",
                                    data: null,
                                }),
                            );
                            return;
                        }
                        if (
                            !Array.isArray(next.scenes) ||
                            !Array.isArray(next.meshes) ||
                            !Array.isArray(next.textures) ||
                            !Array.isArray(next.merchants) ||
                            !next.drafts
                        )
                            throw new Error("Invalid fixture data.");
                        next.revision += 1;
                        await mkdir(directory, { recursive: true });
                        const temp = `${file}.${process.pid}.tmp`;
                        await writeFile(temp, JSON.stringify(next));
                        await rename(temp, file);
                        res.end(JSON.stringify({ success: true, message: "", data: next }));
                    } finally {
                        await rmdir(lock);
                    }
                };
                queue = queue.then(run).catch((error) => {
                    if (!res.headersSent) res.statusCode = 400;
                    res.end(JSON.stringify({ success: false, message: error.message, data: null }));
                });
            });
        },
    };
}
