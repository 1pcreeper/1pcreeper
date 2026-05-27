package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.Occupation;
import project.office_workforce_service.repository.OccupationRepository;
import project.office_workforce_service.service.base.AbstractBaseService;

@Service
public class OccupationManagerService extends AbstractBaseService<Occupation, Long> {

    private final OccupationRepository occupationRepository;

    @Autowired
    public OccupationManagerService(OccupationRepository occupationRepository) {
        super(occupationRepository, "Occupation");
        this.occupationRepository = occupationRepository;
    }

    public Page<Occupation> search(Long orgId, String q, Boolean isActive, Pageable pageable) {
        return occupationRepository.search(orgId, q, isActive, pageable);
    }
}