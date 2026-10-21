# Mesh storage: backend MinIO and browser cache

This is a future storage design. This stage stores development data locally through the Vite fixture bridge; it does not create a bucket, upload to a cloud service, change Docker, or implement a Java storage service.

## Separate storage responsibilities

**Backend mesh bucket** means the MinIO server bucket `mesh`. It is authoritative binary storage behind mesh-service. **Browser storage bucket** means the visitor/admin device’s disposable cache: Cache Storage for verified GLB blobs and IndexedDB for mesh ID/version/digest metadata. They do not share credentials, namespaces or lifecycle. Clearing browser cache never deletes a MinIO object.

The frontend uses browser caching now; MinIO and the Java local-filesystem adapter remain planned. [WEBSOCKET.md](WEBSOCKET.md) defines the implemented client protocol and backend integration sequence.

## Stable logical layout

Bucket name when MinIO is introduced: `mesh`. A local Java adapter will use the same relative keys beneath `data/local/mesh/`, so switching implementations does not change database references.

```text
mesh/
  private/
    merchants/{merchantUid}/
      assets/{meshUid}/
        versions/{meshVersionUid}/
          sources/{sourceUid}.obj
          textures/{textureUid}/original.{png|jpg|webp}
          assembly.json
          import-report.json
      textures/{textureUid}/original.{png|jpg|webp}
  public/
    assets/{meshUid}/versions/{meshVersionUid}/
      model.glb
      thumbnail.webp
      manifest.json
      lod/model-low.glb                # later optimization
    textures/{textureUid}/{sha256}.webp
  staging/
    {uploadUid}/
      source.obj
      textures/{generatedFileUid}.png
      candidate.glb
      validation.json
```

The bucket name is separate from each object key: the key begins `public/assets/...`, not `mesh/public/assets/...`. MinIO folders are key prefixes, not real directories. Do not use user names, email addresses, untrusted filenames, filesystem absolute paths, access tokens or signed URLs in keys.

| Prefix/object | Purpose | Read access | Lifecycle |
|---|---|---|---|
| `private/.../sources` | Original editable OBJ input | Owner/staff through authenticated service | Retain while version is recoverable |
| `private/.../textures` | Original image input | Owner/staff | Retain with source/version references |
| `assembly.json` | Named source instances, normalization, transforms, material slots | Owner/staff | Immutable per committed version |
| `import-report.json` | Sanitized validation findings | Staff | Retention policy |
| `public/.../model.glb` | Browser-ready compiled binary, ideally embedding textures | Anonymous via approved gateway path | Immutable; retain while published scenes refer to it |
| `public/.../manifest.json` | Public bounds, digest, MIME/size and render budget | Anonymous | Immutable; no private owner/source data |
| `public/textures` | Sanitized public texture derivatives | Anonymous when published | Reference-count/retention cleanup |
| `staging` | Incomplete uploads and conversion output | Service only | Expire failed/abandoned uploads after a configured period |

## Database references

`mesh_versions.glb_object_key`, `manifest_object_key`, `sha256`, `byte_size`, and bounds identify a committed derivative. Source and texture rows reference their own keys/digests. `game_db` stores mesh UID + exact version UID only; it must not store absolute files or a bucket client configuration. Resolve public numeric mesh IDs to those internal UIDs through mesh-service; download exact versions through paged STOMP requests.

The browser sends mesh ID and immutable version ID to `/app/mesh/fragments`. Mesh-service resolves the stored object key and reads only the requested byte ranges from MinIO. Private source files are never exposed by that public fragment endpoint. The gateway routes the SockJS connection to the game-service dispatcher, which forwards mesh requests internally; it does not expose a general arbitrary bucket-key or filesystem endpoint.

## Commit sequence

1. Receive a generated upload UID; authenticate the staff user and validate ownership.
2. Stream source files into `staging/{uploadUid}`. Validate extension, decoded MIME/content, finite geometry, texture dimensions, parse limits, file size and source quotas.
3. Convert/export or validate the browser GLB. Compute SHA-256, byte count, bounds and triangle count. Preserve source object IDs/material bindings in the editable manifest.
4. Write immutable version keys and verify reads/digests. Filesystem adapter uses temporary files and atomic moves within the same filesystem. The MinIO adapter uses object writes and explicit verification; do not assume a multi-object atomic rename exists.
5. Commit the mesh version + live asset pointer + outbox event in one mesh database transaction. Return paginated metadata containing the immutable version ID only after publication succeeds.
6. A game scene publication resolves and pins exact mesh version UIDs via gRPC, then commits its own snapshot transaction. Never mix half-published revisions.

A database failure after bytes are written leaves recoverable orphan content for later cleanup. A storage failure leaves the previous committed version live. Retry a commit with an idempotency key/upload UID so a network retry does not create duplicate revisions.

## Delivery and browser caching

- MinIO stores ordinary GLB bytes and metadata (MIME, SHA-256, byte length), not Base64 copies. Mesh-service encodes requested byte ranges into text-safe Base64 fragments for SockJS.
- Raw fragment size is 12 KiB; browser requests three fragments per response. Every response uses `APIBaseResponseDTO<PaginationBaseResponseDTO<MeshFragmentDTO>>`. The global page maximum is 20, and the fragment endpoint applies the stricter cap of 3 for message byte limits.
- Published immutable versions remain readable while any retained scene references them. A library commit creates a new version; it does not overwrite the prior key or cause old instances to silently switch versions.
- Browser cache key is `meshId@versionId`. Verify the blob’s GLB header, length and SHA-256 against completion metadata before reuse. Cache hits do not send mesh transfer requests; the browser still obtains current scene/chunk metadata.
- Write the complete verified blob first, then the IndexedDB completion record. Missing either record/file, a version change or corruption triggers a fresh download. Failed downloads never create a completion record.
- Use the named Storage Bucket `mesh-assets` and cache `mesh-files-v2` where supported, otherwise the origin’s default Cache Storage. Metadata is in IndexedDB `mesh-district-index-v2`. Storage failures use bounded memory (64 files / 128 MiB); persistent cache remains subject to browser quota and eviction. No storage permission prompt is forced.
- Cross-origin admin/visitor apps have separate browser caches. Private source content is not placed in the public derivative cache. The service worker precaches the app shell separately and must not cache authenticated API/draft responses.
- Restrict origins, validate session authority and requested publication, and use session-private replies. The client never supplies MinIO credentials or signed object keys. Optional future CDN/HTTP delivery is outside the current SockJS contract.

## Local implementation and migration

Implement `MeshStorageService` with `LocalFileMeshStorageService` first, selected by the local Spring profile. Resolve normalized server-generated paths beneath the configured root and guard against symlink traversal. Do not require Docker or MinIO while developing. The current frontend-only store remains `frontend/general/web/.mesh-shop-runtime/world.json`; it is not the future Java disk format.

When MinIO is needed, implement `MinioMeshStorageService`, copy each key byte-for-byte, validate every digest/size, switch the storage profile, and retain a rollback window. Keep the same STOMP destinations, immutable version IDs and database keys. Enable bucket versioning/retention only after an explicit deployment policy is chosen; it is not a substitute for application-level immutable mesh versions.

Deleting a placed scene instance must not remove the mesh asset. Archive library entries rather than erasing referenced binaries. A cleanup worker must prove that no retained mesh/scene revision references a key before deleting it; grace periods and cross-service acknowledgement protect visitors and rollback snapshots. Do not use a blind object-prefix delete for normal editor actions.
