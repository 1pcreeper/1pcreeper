# Validation record — 3 October 2026

## Scope and source preservation

This pass changes the independent `frontend/general/web` workspace and its documentation. `git diff` shows no changes to original backend, SQL, office code or root scripts. The earlier 28 September validation compared 741 reference files with source snapshot `a03bc943a011114966e7429a9a32a0eb17cdcca7`; that historical comparison is not a new backend integration test.

Backend game/mesh services, new gateway routing and MinIO remain **plans**, following the original frontend-only scope. The production frontend now includes the real SockJS/STOMP adapter; local development selects an in-process protocol simulator and shared fixture bridge. The bridge reads/writes a complete local fixture file for simulation; its private development storage endpoint is not the proposed paged backend API or a production scalability implementation.

## Automated checks

From `frontend/general/web`:

- `npm run typecheck`: shared package and both applications pass.
- `npm test`: **30 passing tests** across service, cache and STOMP lifecycle suites.
- `npm run build`: both production PWAs compile and generate manifests/service workers, with a 14-entry app-shell precache each.

Covered behaviors:

- Maps, spots and places each return at most 20 rows per chunk response; 47 nearby instances are collected over three requests, while distant instances are excluded. Aborted requests stop the old loop.
- A 43-operation edit is submitted in pages and leaves unseen scene instances intact. Explicit deletion affects only known IDs. Draft/publication generations reject stale writers; draft privacy, discard and approved merchant requirements remain covered.
- Catalogs search/filter before returning pages; scene/mesh list metadata does not embed object arrays or GLB data. Mesh IDs are numeric; source interactions are stripped and old immutable versions remain available.
- Twenty-six Base64 fragments are assembled over nine requests. Matching cached versions produce no repeat transfer; concurrent identical requests share one download; version changes and missing/corrupt blobs refetch.
- Out-of-order fragments, wrong versions, checksum mismatches and interrupted transfers never produce completed cache records. Fake IndexedDB + a Cache Storage double verify persistence across cache-store instances.
- The real STOMP adapter is unit-tested with a client double for one-connection request correlation, reverse-order replies, cancellation/late replies, connection loss and re-subscription. These tests do not connect to a real Spring server.
- Jump rises, consumes an airborne second press without double-jumping, and lands. Existing OBJ validation, change review and geographic transform synchronization remain tested.

## Browser checks in this pass

Verified against the development apps in the Codex in-app browser:

- Shared chunked map loads 25 nearby spaces with a paged directory, and routes into the shop and reading room.
- First-person mode remains selected across map → spot → place. Product inspection and deep links open full-screen details with a rendered cached GLB and price. Space input and the Jump control are available; basic jump motion is also covered by the unit test above.
- Admin scene editor loads nearby objects, selects a door and exposes per-instance teleport type, destination, arrival coordinates and facing.
- Destination dropdown advances to page 2, searches “reading”, and returns the matching place. Its scroll area and page controls stay inside the viewport rather than clipping at the inspector edge.
- A changed arrival X value is saved privately, published, and used by the visitor transition. The original arrival coordinate was restored through a second save/publication. The local fixture retains publication history; no cloud write occurred.
- Numeric `/meshes/1` opens the mesh source editor separately from scene interaction editing.
- Phone viewport 390×844: compact editor and full-screen product layout inspected. A grid minimum-width issue found in the product dialog was corrected and checked for horizontal overflow.
- Browser console checks on the visitor and editor showed no application errors during these flows.

The earlier September pass additionally checked multi-file OBJ import, texture upload/drop, GLB export/reuse and PWA preview smoke tests. Those are historical checks; this pass focuses on streaming/paging/navigation changes rather than claiming every device/export combination was retested.

## Limits and integration work

No real Spring SockJS broker, gateway session routing, Firebase project, PostgreSQL migration, gRPC mesh dispatcher or MinIO instance was connected. Their contract/security/transaction requirements are in [WEBSOCKET.md](WEBSOCKET.md), [API.md](API.md) and [DATABASE.md](DATABASE.md). Live production integration remains necessary before release.

Chunk metadata is paged, but the simulator uses local arrays/files internally. Browser storage remains subject to quota/eviction; fallback memory and object URLs are bounded. Cache hits avoid mesh transfer, not the scene metadata requests needed to know the correct versions. The scene viewer uses conservative fixture bounds and basic AABB collision/gravity, not terrain physics or a global map engine. Production geospatial bounds/indexes, LODs, compressed assets and multi-device performance need representative data tests.

Shopping, carts, payments, real merchant claim synchronization and cloud uploads remain outside this stage. Original backend pagination behavior has not been retroactively changed; the mandatory Page/Pageable/PaginationMapper rule is documented for the future backend work.
