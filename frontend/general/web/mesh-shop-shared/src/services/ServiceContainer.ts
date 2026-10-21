import { AxiosTransportService, type TransportService } from "./base/TransportService";
import MockTransportService from "./base/MockTransportService";
import { StompTransportService, type SocketTransportService } from "./realtime/SocketTransportService";
import MockSocketTransportService from "./realtime/MockSocketTransportService";
import MeshCacheService from "./storage/MeshCacheService";
import { modelFactory } from "./content/ModelFactoryService";
import AuthService, { isMockMode } from "./content/AuthService";
import GameContentService from "./content/GameContentService";
import MeshContentService from "./content/MeshContentService";
import type { AccountResponseDTO } from "../models/dto/mesh.dto";
import { unwrapResponse } from "../models/dto/base.dto";

export default class ServiceContainer {
    private static INSTANCE: ServiceContainer;
    public readonly auth = AuthService.getInstance();
    public readonly game: GameContentService;
    public readonly mesh: MeshContentService;
    public readonly socket: SocketTransportService;
    public readonly meshCache: MeshCacheService;
    private constructor(private readonly transport: TransportService) {
        this.socket = isMockMode
            ? new MockSocketTransportService()
            : new StompTransportService(import.meta.env.VITE_STREAM_URL || "/api/v1/realtime", () =>
                  this.auth.getToken(),
              );
        this.auth.onSessionChange(() => {
            if (this.socket instanceof StompTransportService) void this.socket.disconnect();
        });
        this.game = GameContentService.getInstance(transport, this.socket);
        this.mesh = MeshContentService.getInstance(transport);
        this.meshCache = new MeshCacheService(this.socket);
        modelFactory.resolveAsset = (id, version) => this.meshCache.objectUrl(id, version);
        const textures = new Map<string, ReturnType<MeshContentService["findTexture"]>>();
        modelFactory.resolveTexture = (id) => {
            if (!textures.has(id)) {
                textures.set(
                    id,
                    this.mesh.findTexture(id).catch((error) => {
                        textures.delete(id);
                        throw error;
                    }),
                );
                if (textures.size > 64) textures.delete(textures.keys().next().value!);
            }
            return textures.get(id)!;
        };
    }
    public static getInstance(): ServiceContainer {
        return (this.INSTANCE ??= new ServiceContainer(
            isMockMode
                ? new MockTransportService()
                : new AxiosTransportService(import.meta.env.VITE_API_BASE_URL || "/api/v1", () =>
                      AuthService.getInstance().getToken(),
                  ),
        ));
    }
    public async verifyAccount() {
        return unwrapResponse(await this.transport.request<AccountResponseDTO>("/account/auth/verify"));
    }
}
export const services = ServiceContainer.getInstance();
