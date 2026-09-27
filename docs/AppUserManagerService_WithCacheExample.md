```java
    @Transactional // Always ensure database mutations are wrapped in a transaction
    public class AppUserManagerService extends AbstractBaseService<AppUser, Long> {
    
        private final AppUserCacheService appUserCacheService;
    
        @Autowired
        public AppUserManagerService(AppUserRepository repository, AppUserCacheService appUserCacheService) {
            super(repository, "AppUser");
            this.appUserCacheService = appUserCacheService;
        }
    
        // --- READS ---
        @Override
        @Transactional(readOnly = true)
        public AppUser findById(Long id) {
            // Automatically fetches from cache, OR calls DB + populates cache cleanly!
            AppUserCacheDTO dto = appUserCacheService.findByIdOrLoad(id, () -> {
                AppUser dbEntity = super.findById(id); // Throws ResourceNotFoundException if missing
                return convertToDto(dbEntity);
            });
    
            return convertToEntity(dto);
        }
    
        // --- WRITES & MUTATIONS ---
        @Override
        public AppUser save(AppUser entity) {
            AppUser saved = super.save(entity);
            appUserCacheService.save(saved.getId(), convertToDto(saved));
            return saved;
        }
    
        @Override
        public void delete(AppUser entity) {
            super.delete(entity);
            appUserCacheService.delete(entity.getId());
        }
    
        // CRITICAL: Overriding parent delete mappings to avoid cache leaks
        @Override
        public void deleteById(Long id) {
            super.deleteById(id); // Deletes from DB (or throws error)
            appUserCacheService.delete(id); // Syncs cache eviction
        }
    
        @Override
        public void deleteAllByIds(List<Long> ids) {
            super.deleteAllByIds(ids);
            ids.forEach(appUserCacheService::delete);
        }
    
        @Override
        public void deleteAll(List<AppUser> entities) {
            super.deleteAll(entities);
            entities.forEach(e -> appUserCacheService.delete(e.getId()));
        }
    
        // --- MAPPING UTILITIES ---
        private AppUserCacheDTO convertToDto(AppUser entity) {
            return AppUserCacheDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
        }
    
        private AppUser convertToEntity(AppUserCacheDTO cacheDTO) {
            return AppUser.builder()
                .id(cacheDTO.getId())
                .name(cacheDTO.getName())
                .build();
        }
    }         

```