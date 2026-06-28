package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.PersonDetailMapper;
import project.office_workforce_service.mapper.PersonMapper;
import project.office_workforce_service.mapper.StaffMapper;
import project.office_workforce_service.model.dto.object.PersonDTO;
import project.office_workforce_service.model.dto.object.PersonDetailDTO;
import project.office_workforce_service.model.dto.object.StaffDTO;
import project.office_workforce_service.model.dto.request.PersonCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PersonUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PersonDetailResponseDTO;
import project.office_workforce_service.model.dto.response.PersonResponseDTO;
import project.office_workforce_service.model.entity.Person;
import project.office_workforce_service.model.entity.PersonDetail;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.service.manager.PersonDetailManagerService;
import project.office_workforce_service.service.manager.PersonManagerService;
import project.office_workforce_service.service.manager.StaffManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.util.List;

@Service
public class PersonService {

    @Autowired
    private PersonManagerService personManagerService;

    @Autowired
    private PersonDetailManagerService personDetailManagerService;
    
    @Autowired
    private StaffManagerService staffManagerService;

    @Autowired
    private PersonMapper personMapper;

    @Autowired
    private PersonDetailMapper personDetailMapper;

    @Autowired
    private StaffMapper staffMapper;
    
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<PersonResponseDTO> search(
        @Nullable String q,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            personManagerService.search(q, isActive, pageable),
            person -> personMapper.toResponseDTO(person)
        );
    }

    public PersonResponseDTO findById(Long id) {
        Person person = personManagerService.findById(id);
        PersonDetail detail = personDetailManagerService.findByPersonId(id);
        return personMapper.toResponseDTO(person);
    }

    @Transactional
    public PersonResponseDTO create(PersonCreateRequestDTO requestDTO) {
        Person newPerson = personMapper.toEntity(requestDTO);
        Person savedPerson = personManagerService.save(newPerson);

        return personMapper.toResponseDTO(savedPerson);
    }

    @Transactional
    public PersonResponseDTO update(Long id, PersonUpdateRequestDTO requestDTO) {
        Person existingPerson = personManagerService.findById(id);

        personMapper.updateEntity(requestDTO, existingPerson);
        Person savedPerson = personManagerService.save(existingPerson);

        return personMapper.toResponseDTO(savedPerson);
    }
    public PaginationBaseResponseDTO<PersonResponseDTO> findAll(Pageable pageable){
        return paginationMapper.toDTO(
            personManagerService.findAllByIsActive(true,pageable),
            p->personMapper.toResponseDTO(p)
        );
    }
    @Transactional
    public void delete(Long id){
        Person existingPerson = personManagerService.findById(id);
        existingPerson.setIsActive(false);
        personManagerService.save(existingPerson);
    }
    
    public PersonDetailResponseDTO findByIdInDetail(Long id){
        PersonDetail existingPersonDetail = personDetailManagerService.findByPersonId(id);
        Person existingPerson = existingPersonDetail.getPerson();
        List<Staff> staffs = staffManagerService.findByPersonId(id);

        PersonDetailDTO personDetailDTO = personDetailMapper.tpPersonDetailDTO(existingPersonDetail);
        PersonDTO personDTO = personMapper.toPersonDTO(existingPerson);
        List<StaffDTO> staffDTOs = staffs.stream().map(s->staffMapper.toStaffDTO(s))
            .filter(StaffDTO::getIsActive).toList();
        
        return PersonDetailResponseDTO.builder()
            .person(personDTO)
            .detail(personDetailDTO)
            .staffs(staffDTOs)
            .build();
    }
}