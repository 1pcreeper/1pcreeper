package project.office_workforce_service.repository;

import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.StaffDetail;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.util.Optional;

@Repository
public interface StaffDetailRepository extends AbstractBaseRepository<StaffDetail, Long> {
    
    Optional<StaffDetail> findByStaffId(Long staffId);
}