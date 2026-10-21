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
        return save((Object) id, cacheDTO);
    }

    public C save(Object key, C cacheDTO) {
        if (cache != null && key != null && cacheDTO != null) {
            cache.put(key, cacheDTO);
        }
        return cacheDTO;
    }

    // Thread-safe self-populating loader pattern
    public C findByIdOrLoad(Long id, Supplier<C> databaseLoader) {
        return findByKeyOrLoad((Object) id, databaseLoader);
    }

    public C findByKeyOrLoad(Object key, Supplier<C> loader) {
        if (cache == null || key == null) return loader.get();

        // Native Spring Cache provider lock (prevents database/network stampede)
        return cache.get(key, () -> loader.get());
    }

    public void delete(Long id) {
        delete((Object) id);
    }

    public void delete(Object key) {
        if (cache != null && key != null) cache.evict(key);
    }

    public void clear() {
        if (cache != null) cache.clear();
    }
}