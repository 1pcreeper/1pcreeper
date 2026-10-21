package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.OccupationMapper;
import project.office_workforce_service.model.dto.request.OccupationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.OccupationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.OccupationResponseDTO;
import project.office_workforce_service.model.entity.Occupation;
import project.office_workforce_service.model.entity.Department;
import project.office_workforce_service.service.checker.OccupationCheckerService;
import project.office_workforce_service.service.manager.OccupationManagerService;
import project.office_workforce_service.service.manager.DepartmentManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class OccupationService {

    @Autowired
    private OccupationManagerService occupationManagerService;
    @Autowired
    private DepartmentManagerService departmentManagerService;
    @Autowired
    private OccupationCheckerService occupationCheckerService;
    @Autowired
    private OccupationMapper occupationMapper;
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<OccupationResponseDTO> search(
        @Nullable Long departId,
        @Nullable String q,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            occupationManagerService.search(departId, q, isActive, pageable),
            occupationMapper::toResponseDTO
        );
    }

    public OccupationResponseDTO findById(Long id) {
        Occupation existing = occupationManagerService.findById(id);
        occupationCheckerService.checkOccupationIsActive(existing);
        return occupationMapper.toResponseDTO(existing);
    }

    @Transactional
    public OccupationResponseDTO create(OccupationCreateRequestDTO requestDTO) {
        occupationCheckerService.checkCreateRequest(requestDTO);
        Department org = departmentManagerService.getReferenceById(requestDTO.getDepartId());
        Occupation newOccupation = occupationMapper.toEntity(requestDTO, org);
        return occupationMapper.toResponseDTO(occupationManagerService.save(newOccupation));
    }

    @Transactional
    public OccupationResponseDTO update(Long id, OccupationUpdateRequestDTO requestDTO) {
        Occupation existingOccupation = occupationManagerService.findById(id);
        occupationCheckerService.checkOccupationIsActive(existingOccupation);
        occupationCheckerService.checkUpdateRequest(id, requestDTO, existingOccupation);
        occupationMapper.updateEntity(requestDTO, existingOccupation);
        return occupationMapper.toResponseDTO(occupationManagerService.save(existingOccupation));
    }
}