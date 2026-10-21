package project.shared_office_starter.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.cache.transaction.TransactionAwareCacheManagerProxy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.Duration;

@Configuration
@EnableCaching
public class CaffeineCacheConfig {

    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager nativeCaffeineCacheManager = new CaffeineCacheManager();
        nativeCaffeineCacheManager.setCaffeine(
            Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(5000)
                .expireAfterWrite(Duration.ofMinutes(10))
                .recordStats()
        );

        // Wrap it inside Spring's TransactionAware Proxy Wrapper (synchronizes cache operations with DB transactions)
        return new TransactionAwareCacheManagerProxy(nativeCaffeineCacheManager);
    }
}
