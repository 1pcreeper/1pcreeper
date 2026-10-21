package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.PersonCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PersonUpdateRequestDTO;
import project.office_workforce_service.model.entity.Person;
import project.office_workforce_service.service.manager.PersonManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class PersonCheckerService {

    private final PersonManagerService personManagerService;

    @Autowired
    public PersonCheckerService(PersonManagerService personManagerService) {
        this.personManagerService = personManagerService;
    }

    public void checkPersonIsActive(Person person) {
        if (person == null || !Boolean.TRUE.equals(person.getIsActive())) {
            throw new ResourceNotFoundException("Person not found or has been deactivated.");
        }
    }

    public void checkCreateRequest(PersonCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Person creation payload cannot be null.");
        }
        if ((dto.getNameEnglish() == null || dto.getNameEnglish().isBlank()) &&
            (dto.getNameChinese() == null || dto.getNameChinese().isBlank())) {
            throw new PropertyValidationException("At least one name (English or Chinese) must be provided.");
        }
        if (dto.getHkId() != null && !dto.getHkId().isBlank()) {
            String hkId = dto.getHkId().trim();
            if (personManagerService.existsByHkId(hkId)) {
                throw new PropertyValidationException("Person with HKID '" + hkId + "' already exists.");
            }
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            String email = dto.getEmail().trim();
            if (personManagerService.existsByEmail(email)) {
                throw new PropertyValidationException("Person with email '" + email + "' already exists.");
            }
        }
    }

    public void checkUpdateRequest(Long currentId, PersonUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Person update payload cannot be null.");
        }
        if (dto.getHkId() != null && !dto.getHkId().isBlank()) {
            String hkId = dto.getHkId().trim();
            personManagerService.findByHkId(hkId).ifPresent(existing -> {
                if (!existing.getId().equals(currentId)) {
                    throw new PropertyValidationException("Another person already holds HKID '" + hkId + "'.");
                }
            });
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            String email = dto.getEmail().trim();
            personManagerService.findByEmail(email).ifPresent(existing -> {
                if (!existing.getId().equals(currentId)) {
                    throw new PropertyValidationException("Another person already holds email '" + email + "'.");
                }
            });
        }
    }
}
