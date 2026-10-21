import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { APIBaseResponseDTO, PaginationBaseResponseDTO } from "../../models/dto/base.dto";
export interface SocketTransportService {
    request<T>(
        destination: string,
        payload: Record<string, unknown>,
        signal?: AbortSignal,
    ): Promise<APIBaseResponseDTO<PaginationBaseResponseDTO<T>>>;
}
export class StompTransportService implements SocketTransportService {
    private readonly client: Client;
    private pending = new Map<
        string,
        { resolve: (value: any) => void; reject: (error: Error) => void; cleanup: () => void }
    >();
    private connection?: Promise<void>;
    public constructor(url: string, tokenProvider: () => Promise<string | null>) {
        this.client = new Client({
            webSocketFactory: () => new SockJS(url),
            reconnectDelay: 3000,
            connectionTimeout: 10000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            beforeConnect: async () => {
                const token = await tokenProvider();
                const csrf = document.cookie
                    .split("; ")
                    .find((value) => value.startsWith("XSRF-TOKEN="))
                    ?.slice(11);
                this.client.connectHeaders = {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...(csrf ? { "X-XSRF-TOKEN": decodeURIComponent(csrf) } : {}),
                };
            },
            onWebSocketClose: () => {
                this.connection = undefined;
                this.failPending(new Error("The streaming connection closed. Retry to reconnect."));
            },
            onStompError: () => this.failPending(new Error("The streaming service rejected the request.")),
        });
        this.client.onConnect = () =>
            this.client.subscribe("/user/queue/mesh-shop", (message) => this.receive(message));
    }
    private receive(message: IMessage) {
        const id = message.headers["correlation-id"];
        const pending = this.pending.get(id);
        if (!pending) return;
        pending.cleanup();
        try {
            pending.resolve(JSON.parse(message.body));
        } catch {
            pending.reject(new Error("The streaming response is not valid JSON."));
        }
    }
    private failPending(error: Error) {
        for (const pending of [...this.pending.values()]) {
            pending.cleanup();
            pending.reject(error);
        }
    }
    private connect(): Promise<void> {
        if (this.client.connected) return Promise.resolve();
        if (this.connection) return this.connection;
        this.connection = new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
                this.connection = undefined;
                reject(new Error("Cannot connect to the streaming service."));
            }, 12000);
            this.client.onConnect = () => {
                this.client.subscribe("/user/queue/mesh-shop", (message) => this.receive(message));
                clearTimeout(timer);
                resolve();
            };
            if (!this.client.active) this.client.activate();
        });
        return this.connection;
    }
    public async request<T>(
        destination: string,
        payload: Record<string, unknown>,
        signal?: AbortSignal,
    ): Promise<APIBaseResponseDTO<PaginationBaseResponseDTO<T>>> {
        signal?.throwIfAborted();
        await this.connect();
        signal?.throwIfAborted();
        return new Promise((resolve, reject) => {
            const requestId = crypto.randomUUID();
            const abort = () => {
                cleanup();
                reject(new DOMException("Cancelled", "AbortError"));
            };
            const timer = setTimeout(() => {
                cleanup();
                reject(new Error("Streaming request timed out. Please retry."));
            }, 20000);
            const cleanup = () => {
                clearTimeout(timer);
                this.pending.delete(requestId);
                signal?.removeEventListener("abort", abort);
            };
            this.pending.set(requestId, { resolve, reject, cleanup });
            signal?.addEventListener("abort", abort, { once: true });
            try {
                this.client.publish({
                    destination,
                    body: JSON.stringify({ ...payload, requestId }),
                    headers: { "content-type": "application/json", "correlation-id": requestId },
                });
            } catch (error) {
                cleanup();
                reject(error);
            }
        });
    }
    public async disconnect() {
        this.failPending(new Error("Streaming disconnected."));
        await this.client.deactivate();
        this.connection = undefined;
    }
}
