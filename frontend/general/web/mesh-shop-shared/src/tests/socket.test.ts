import { afterEach, describe, expect, it, vi } from "vitest";
const harness = vi.hoisted(() => ({ client: undefined as any }));
vi.mock("sockjs-client", () => ({ default: class {} }));
vi.mock("@stomp/stompjs", () => ({
    Client: class {
        connected = false;
        active = false;
        onConnect?: () => void;
        onWebSocketClose?: () => void;
        onStompError?: () => void;
        callback?: (message: any) => void;
        frames: any[] = [];
        connectHeaders: any;
        options: any;
        constructor(options: any) {
            this.options = options;
            Object.assign(this, options);
            harness.client = this;
        }
        async activate() {
            this.active = true;
            await this.options.beforeConnect();
            this.connected = true;
            this.onConnect?.();
        }
        subscribe(destination: string, callback: (message: any) => void) {
            expect(destination).toBe("/user/queue/mesh-shop");
            this.callback = callback;
        }
        publish(frame: any) {
            this.frames.push(frame);
        }
        async deactivate() {
            this.active = false;
            this.connected = false;
            this.onWebSocketClose?.();
        }
    },
}));
import { StompTransportService } from "../services/realtime/SocketTransportService";
const empty = {
    success: true,
    message: "",
    data: { content: [], pageNumber: 0, pageSize: 20, totalPages: 0, totalElements: 0 },
};
afterEach(() => vi.unstubAllGlobals());
function setup() {
    vi.stubGlobal("document", { cookie: "XSRF-TOKEN=csrf-value" });
    return new StompTransportService("/api/v1/realtime", async () => "test-token");
}
describe("STOMP request lifecycle", () => {
    it("shares a connection and correlates out-of-order replies without changing the page envelope", async () => {
        const socket = setup();
        const first = socket.request("/app/game/chunks", { id: "0" }),
            second = socket.request("/app/mesh/fragments", { meshId: "1" });
        await vi.waitFor(() => expect(harness.client.frames).toHaveLength(2));
        expect(harness.client.connectHeaders).toEqual({
            Authorization: "Bearer test-token",
            "X-XSRF-TOKEN": "csrf-value",
        });
        const frames = harness.client.frames;
        expect(frames[0].headers["correlation-id"]).not.toBe(frames[1].headers["correlation-id"]);
        for (const frame of [...frames].reverse())
            harness.client.callback({
                headers: { "correlation-id": frame.headers["correlation-id"] },
                body: JSON.stringify(empty),
            });
        await expect(first).resolves.toEqual(empty);
        await expect(second).resolves.toEqual(empty);
        await socket.disconnect();
    });
    it("cancels old chunk requests and ignores their late replies", async () => {
        const socket = setup(),
            controller = new AbortController();
        const request = socket.request("/app/game/chunks", {}, controller.signal);
        const rejected = expect(request).rejects.toThrow("Cancelled");
        await vi.waitFor(() => expect(harness.client.frames).toHaveLength(1));
        controller.abort();
        harness.client.callback({ headers: harness.client.frames[0].headers, body: JSON.stringify(empty) });
        await rejected;
        await socket.disconnect();
    });
    it("rejects pending work on connection loss and subscribes again on reconnect", async () => {
        const socket = setup();
        const request = socket.request("/app/game/chunks", {});
        const rejected = expect(request).rejects.toThrow("closed");
        await vi.waitFor(() => expect(harness.client.frames).toHaveLength(1));
        harness.client.connected = false;
        harness.client.onWebSocketClose();
        await rejected;
        const retry = socket.request("/app/game/chunks", {});
        harness.client.connected = true;
        harness.client.onConnect();
        await vi.waitFor(() => expect(harness.client.frames).toHaveLength(2));
        harness.client.callback({ headers: harness.client.frames[1].headers, body: JSON.stringify(empty) });
        await expect(retry).resolves.toEqual(empty);
        await socket.disconnect();
    });
});
