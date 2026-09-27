```java
    @Service
    public class AppUserCacheService extends AbstractCacheBaseService<AppUserCacheDTO> {
        @Autowired
        public AppUserCacheService(
            CacheManager cacheManager
        ) {
            super("users",AppUserCacheDTO.class,cacheManager);
        }
    }
```