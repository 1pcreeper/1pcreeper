package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.StaffOccupation;
import project.office_workforce_service.repository.StaffOccupationRepository;
import project.office_workforce_service.service.base.AbstractBaseService;

import java.util.List;

@Service
public class StaffOccupationManagerService extends AbstractBaseService<StaffOccupation, Long> {

    private final StaffOccupationRepository staffOccupationRepository;

    @Autowired
    public StaffOccupationManagerService(StaffOccupationRepository staffOccupationRepository) {
        super(staffOccupationRepository, "StaffOccupation");
        this.staffOccupationRepository = staffOccupationRepository;
    }

    public Page<StaffOccupation> search(Long staffId, Long occupationId, String q, Pageable pageable) {
        return staffOccupationRepository.search(staffId, occupationId, q, pageable);
    }
    public List<StaffOccupation> findByStaffId(Long staffId){
        return  staffOccupationRepository.findByStaffId(staffId);   
    }
}