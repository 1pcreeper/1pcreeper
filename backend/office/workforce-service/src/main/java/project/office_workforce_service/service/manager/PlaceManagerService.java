package project.office_workforce_service.service.manager;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.repository.PlaceRepository;
import project.office_workforce_service.service.base.AbstractBaseService;

@Service
public class PlaceManagerService extends AbstractBaseService<Place, Long> {

    private final PlaceRepository placeRepository;

    @Autowired
    public PlaceManagerService(PlaceRepository placeRepository) {
        super(placeRepository, "Place");
        this.placeRepository = placeRepository;
    }

    public Page<Place> search(Long companyId, Long departId, @Nullable String q, Boolean isActive, Pageable pageable) {
        return placeRepository.search(companyId, departId, q, isActive, pageable);
    }

    public boolean existsByDepartmentIdAndNameIgnoreCase(Long departmentId, String name) {
        return placeRepository.existsByDepartmentIdAndNameIgnoreCase(departmentId, name);
    }

    public java.util.Optional<Place> findByDepartmentIdAndNameIgnoreCase(Long departmentId, String name) {
        return placeRepository.findByDepartmentIdAndNameIgnoreCase(departmentId, name);
    }
}