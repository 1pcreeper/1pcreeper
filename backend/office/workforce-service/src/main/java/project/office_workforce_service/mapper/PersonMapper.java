package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.object.PersonDTO;
import project.office_workforce_service.model.dto.request.PersonCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PersonUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PersonResponseDTO;
import project.office_workforce_service.model.entity.Person;
import project.office_workforce_service.model.entity.PersonDetail;

@Component
public class PersonMapper {

    
    private String emptyToNull(String value) {
        if (value == null) return null;
        value = value.trim();
        return value.isEmpty() ? null : value;
    }

    public Person toEntity(PersonCreateRequestDTO request) {
        if (request == null) {
            return null;
        }
        return Person.builder()
            .nameEnglish(request.getNameEnglish())
            .nameChinese(request.getNameChinese())
            .officeTel(emptyToNull(request.getOfficeTel()))
            .mobileTel(emptyToNull(request.getMobileTel()))
            .email(emptyToNull(request.getEmail()))
            .hkId(emptyToNull(request.getHkId()))
            .cnId(emptyToNull(request.getCnId()))
            .moId(emptyToNull(request.getMoId()))
            .passportId(emptyToNull(request.getPassportId()))
            .isActive(true) // Default to true on creation
            .build();
    }

    public void updateEntity(PersonUpdateRequestDTO request, Person entity) {
        if (request == null || entity == null) return;

        if (request.getNameEnglish() != null) entity.setNameEnglish(request.getNameEnglish());
        if (request.getNameChinese() != null) entity.setNameChinese(request.getNameChinese());
        if (request.getOfficeTel() != null) entity.setOfficeTel(emptyToNull(request.getOfficeTel()));
        if (request.getMobileTel() != null) entity.setMobileTel(emptyToNull(request.getMobileTel()));
        if (request.getEmail() != null) entity.setEmail(emptyToNull(request.getEmail()));

        if (request.getHkId() != null) entity.setHkId(emptyToNull(request.getHkId()));
        if (request.getCnId() != null) entity.setCnId(emptyToNull(request.getCnId()));
        if (request.getMoId() != null) entity.setMoId(emptyToNull(request.getMoId()));
        if (request.getPassportId() != null) entity.setPassportId(emptyToNull(request.getPassportId()));

        entity.setIsActive(true);
    }

    public PersonResponseDTO toResponseDTO(Person person) {
        if (person == null) {
            return null;
        }

        return PersonResponseDTO.builder()
            .id(person.getId())
            .uid(person.getUid())
            .nameEnglish(person.getNameEnglish())
            .nameChinese(person.getNameChinese())
            .officeTel(person.getOfficeTel())
            .mobileTel(person.getMobileTel())
            .email(person.getEmail())
            .hkId(person.getHkId())
            .cnId(person.getCnId())
            .moId(person.getMoId())
            .passportId(person.getPassportId())
            .isActive(person.getIsActive())
            .createdAt(person.getCreatedAt())
            .updatedAt(person.getUpdatedAt())
            .build();
    }

    public PersonDTO toPersonDTO(Person person) {
        if (person == null) {
            return null;
        }

        return PersonDTO.builder()
            .id(person.getId())
            .uid(person.getUid())
            .nameEnglish(person.getNameEnglish())
            .nameChinese(person.getNameChinese())
            .officeTel(person.getOfficeTel())
            .mobileTel(person.getMobileTel())
            .email(person.getEmail())
            .hkId(person.getHkId())
            .cnId(person.getCnId())
            .moId(person.getMoId())
            .passportId(person.getPassportId())
            .isActive(person.getIsActive())
            .createdAt(person.getCreatedAt())
            .updatedAt(person.getUpdatedAt())
            .build();
    }
}