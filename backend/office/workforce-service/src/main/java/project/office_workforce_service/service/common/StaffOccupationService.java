package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.StaffOccupationMapper;
import project.office_workforce_service.model.dto.request.StaffOccupationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffOccupationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.StaffOccupationResponseDTO;
import project.office_workforce_service.model.entity.Occupation;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.StaffOccupation;
import project.office_workforce_service.service.manager.OccupationManagerService;
import project.office_workforce_service.service.manager.StaffManagerService;
import project.office_workforce_service.service.manager.StaffOccupationManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class StaffOccupationService {

    @Autowired
    private StaffOccupationManagerService staffOccupationManagerService;
    @Autowired
    private StaffManagerService staffManagerService;
    @Autowired
    private OccupationManagerService occupationManagerService;
    @Autowired
    private StaffOccupationMapper mapper;
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<StaffOccupationResponseDTO> search(
        @Nullable Long staffId,
        @Nullable Long occupationId,
        @Nullable String q,
        Pageable pageable) {

        return paginationMapper.toDTO(
            staffOccupationManagerService.search(staffId, occupationId, q, pageable),
            mapper::toResponseDTO
        );
    }

    public StaffOccupationResponseDTO findById(Long id) {
        return mapper.toResponseDTO(staffOccupationManagerService.findById(id));
    }

    @Transactional
    public StaffOccupationResponseDTO create(StaffOccupationCreateRequestDTO requestDTO) {
        Staff staff = staffManagerService.getReferenceById(requestDTO.getStaffId());
        Occupation occupation = occupationManagerService.getReferenceById(requestDTO.getOccupationId());

        StaffOccupation entity = mapper.toEntity(requestDTO, staff, occupation);
        return mapper.toResponseDTO(staffOccupationManagerService.save(entity));
    }

    @Transactional
    public StaffOccupationResponseDTO update(Long id, StaffOccupationUpdateRequestDTO requestDTO) {
        StaffOccupation existing = staffOccupationManagerService.findById(id);

        Occupation newOccupation = null;
        if (requestDTO.getOccupationId() != null) {
            newOccupation = occupationManagerService.getReferenceById(requestDTO.getOccupationId());
        }

        mapper.updateEntity(requestDTO, existing, newOccupation);
        return mapper.toResponseDTO(staffOccupationManagerService.save(existing));
    }
}