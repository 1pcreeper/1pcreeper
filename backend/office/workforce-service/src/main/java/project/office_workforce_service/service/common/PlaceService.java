package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.PlaceMapper;
import project.office_workforce_service.model.dto.request.PlaceCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PlaceResponseDTO;
import project.office_workforce_service.model.entity.Department;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.service.checker.PlaceCheckerService;
import project.office_workforce_service.service.manager.DepartmentManagerService;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class PlaceService {

    @Autowired
    private PlaceManagerService placeManagerService;
    @Autowired
    private DepartmentManagerService departmentManagerService;
    @Autowired
    private PlaceCheckerService placeCheckerService;
    @Autowired
    private PlaceMapper placeMapper;
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<PlaceResponseDTO> search(
        @Nullable Long companyId,
        @Nullable Long departId,
        @Nullable String q,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            placeManagerService.search(companyId, departId, q, isActive, pageable),
            placeMapper::toResponseDTO
        );
    }

    public PlaceResponseDTO findById(Long id) {
        Place place = placeManagerService.findById(id);
        placeCheckerService.checkPlaceIsActive(place);
        return placeMapper.toResponseDTO(place);
    }

    @Transactional
    public PlaceResponseDTO create(PlaceCreateRequestDTO requestDTO) {
        placeCheckerService.checkCreateRequest(requestDTO);
        Department org = departmentManagerService.getReferenceById(requestDTO.getDepartId());
        Place newPlace = placeMapper.toEntity(requestDTO, org);
        return placeMapper.toResponseDTO(placeManagerService.save(newPlace));
    }

    @Transactional
    public PlaceResponseDTO update(Long id, PlaceUpdateRequestDTO requestDTO) {
        Place existingPlace = placeManagerService.findById(id);
        placeCheckerService.checkPlaceIsActive(existingPlace);
        placeCheckerService.checkUpdateRequest(id, requestDTO, existingPlace);
        placeMapper.updateEntity(requestDTO, existingPlace);
        return placeMapper.toResponseDTO(placeManagerService.save(existingPlace));
    }

    @Transactional
    public void delete(Long id) {
        Place existingPlace = placeManagerService.findById(id);
        placeCheckerService.checkPlaceIsActive(existingPlace);
        existingPlace.setIsActive(false);
        placeManagerService.save(existingPlace);
    }
}