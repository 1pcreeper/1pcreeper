package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.PersonMapper;
import project.office_workforce_service.model.dto.request.PersonCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PersonUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PersonResponseDTO;
import project.office_workforce_service.model.entity.Person;
import project.office_workforce_service.model.entity.PersonDetail;
import project.office_workforce_service.service.manager.PersonDetailManagerService;
import project.office_workforce_service.service.manager.PersonManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class PersonService {

    @Autowired
    private PersonManagerService personManagerService;

    @Autowired
    private PersonDetailManagerService personDetailManagerService;

    @Autowired
    private PersonMapper personMapper;

    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<PersonResponseDTO> search(
        @Nullable String q,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            personManagerService.search(q, isActive, pageable),
            person -> personMapper.toResponseDTO(person, null)
        );
    }

    public PersonResponseDTO findById(Long id) {
        Person person = personManagerService.findById(id);
        PersonDetail detail = personDetailManagerService.findByPersonId(id);
        return personMapper.toResponseDTO(person, detail);
    }

    @Transactional
    public PersonResponseDTO create(PersonCreateRequestDTO requestDTO) {
        Person newPerson = personMapper.toEntity(requestDTO);
        Person savedPerson = personManagerService.save(newPerson);

        return personMapper.toResponseDTO(savedPerson, null);
    }

    @Transactional
    public PersonResponseDTO update(Long id, PersonUpdateRequestDTO requestDTO) {
        Person existingPerson = personManagerService.findById(id);

        personMapper.updateEntity(requestDTO, existingPerson);
        Person savedPerson = personManagerService.save(existingPerson);

        PersonDetail detail = null;
        try {
            detail = personDetailManagerService.findByPersonId(id);
        } catch (Exception ignored) {}

        return personMapper.toResponseDTO(savedPerson, detail);
    }
}