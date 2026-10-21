# Mesh District / Mesh Studio

Two React + TypeScript + Vite PWAs with a shared Three.js viewer and injectable singleton services. This nested workspace leaves the original root/office scripts unchanged.

## Run locally

Requires Node.js 22.12+ (verified with Node 26.4) and npm. From this directory:

```sh
npm ci
npm run dev:user
```

In a second terminal, from the same directory:

```sh
npm run dev:admin
```

- Visitor: http://localhost:5173/home
- Studio: http://localhost:5174/dashboard
- Featured showroom: http://localhost:5173/game/spots/13
- Example deep link: http://localhost:5173/game/spots/13?productId=1234
- Mesh editor: http://localhost:5174/meshes/new

No accounts, Java services, containers or cloud storage are needed in development. The studio uses a clearly labelled demo administrator. Both development servers share the ignored `.mesh-shop-runtime/world.json` fixture store. Publish in Studio, then reload the visitor scene to see it. To reset the demo intentionally, stop both servers and remove that fixture file. This removes local edits and imports; save/export anything you need first.

## Verify and build

```sh
npm run typecheck
npm test
npm run build
```

`build` defaults to real Axios metadata endpoints and SockJS/STOMP streams (`VITE_STREAM_URL=/api/v1/realtime`). Copy each app's `.env.example` to its own `.env.local`, set `VITE_USE_MOCK=false`, and configure your Firebase project and gateway when the future backend is available. Vite dev proxies `/api` to port 8080. Never put server secrets or Firebase service-account credentials in `VITE_` variables.

For a self-contained mock production preview:

```sh
npm run build:demo
npm run preview -w user-mesh-shop-web
npm run preview -w admin-mesh-shop-web
```

Preview URLs use ports 6173 and 6174. The explicitly built demo stores state per browser origin, so these preview apps do not share edits. Use the development servers for shared admin/visitor data. PWA service workers register in production/preview builds; development avoids stale app-shell caching. Each app is intended for its own origin at `/`, with SPA fallback.

## Explore and edit

Spectator: drag to orbit, right-drag to pan, wheel to zoom. First person: click an object to inspect it or enter its space; drag to look, or click empty space to capture the mouse, WASD/arrows to move, Space to jump, Escape to release; on touch devices drag to look and use the movement buttons. Hover products for a 3D preview and choose See More for full-screen details. Placed objects may teleport to a configured space/location; view mode stays unchanged. All maps/spots/places use 24m cells and a paged 5×5 chunk window. Mesh files are cached by immutable version in browser storage, separate from backend MinIO. The directory supports the same navigation without 3D interaction.

Studio: drop multiple OBJ files into the workspace, or add a built-in object. Select by clicking the model or hierarchy. G/R/S select move/rotate/scale; numeric transforms are in Properties, and undo/redo uses the toolbar or Cmd/Ctrl+Z / Shift+Z. Upload PNG/JPG/WebP textures and drag onto a model, or select an object then click a texture thumbnail. Use Changes to review, Export GLB to download, and Commit mesh / Publish changes to save a new version. Scene drafts can be saved without affecting the live scene. Assets tab adds reusable mesh instances to a scene. New merchant rooms need a linked placed instance in their parent scene. All placed objects support product/teleport behavior; mesh assets themselves have no interactions. Scene saves send paged deltas so unloaded objects survive. Lists and dataset selectors are paginated.

## Documentation

- [Validation record](../../../docs/content/VALIDATION.md)
- [Architecture](../../../docs/content/ARCHITECTURE.md)
- [SockJS/STOMP plan](../../../docs/content/WEBSOCKET.md)
- [API contract](../../../docs/content/API.md)
- [Abstraction plan](../../../docs/content/ABSTRACTION.md)
- [Database plan](../../../docs/content/DATABASE.md)
- [ER diagrams](../../../docs/content/ERD_DIAGRAMS.md)
- [Mesh storage plan](../../../docs/content/MESH_BUCKET.md)
- [Original request and analysis](../../../docs/prompt/001.md)

Shopping/checkout and the future Java game/mesh services are intentionally outside this stage.
