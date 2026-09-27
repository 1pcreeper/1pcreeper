package project.shared_office_starter.service.base;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import java.util.function.Supplier;


public abstract class AbstractCacheBaseService<C> {
    private final String cacheKey;
    private final Class<C> cacheClass;
    private final Cache cache;

    protected AbstractCacheBaseService(String cacheKey, Class<C> cacheClass, CacheManager cacheManager) {
        this.cacheKey = cacheKey;
        this.cacheClass = cacheClass;
        this.cache = cacheManager.getCache(cacheKey);
    }

    public C save(Long id, C cacheDTO) {
        if (cache != null) {
            cache.put(id, cacheDTO);
        }
        return cacheDTO;
    }

    // Thread-safe self-populating loader pattern
    public C findByIdOrLoad(Long id, Supplier<C> databaseLoader) {
        if (cache == null) return databaseLoader.get();

        // Native Spring Cache provider lock (prevents database stampede)
        return cache.get(id, () -> databaseLoader.get());
    }

    public void delete(Long id) {
        if (cache != null) cache.evict(id);
    }

    public void clear() {
        if (cache != null) cache.clear();
    }
}