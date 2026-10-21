package project.office_transport_service.service.cache;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.dto.object.VehicleDTO;
import project.shared_office_starter.service.base.AbstractCacheBaseService;

@Service
public class VehicleCacheService extends AbstractCacheBaseService<VehicleDTO> {

    @Autowired
    public VehicleCacheService(CacheManager cacheManager) {
        super("vehicles", VehicleDTO.class, cacheManager);
    }
}
