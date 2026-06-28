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

    public Person toEntity(PersonCreateRequestDTO request) {
        if (request == null) {
            return null;
        }
        return Person.builder()
            .nameEnglish(request.getNameEnglish())
            .nameChinese(request.getNameChinese())
            .officeTel(request.getOfficeTel())
            .mobileTel(request.getMobileTel())
            .email(request.getEmail())
            .hkId(request.getHkId())
            .cnId(request.getCnId())
            .moId(request.getMoId())
            .passportId(request.getPassportId())
            .isActive(true) // Default to true on creation
            .build();
    }

    public void updateEntity(PersonUpdateRequestDTO request, Person entity) {
        if (request == null || entity == null) return;

        if (request.getNameEnglish() != null) entity.setNameEnglish(request.getNameEnglish());
        if (request.getNameChinese() != null) entity.setNameChinese(request.getNameChinese());
        if (request.getOfficeTel() != null) entity.setOfficeTel(request.getOfficeTel());
        if (request.getMobileTel() != null) entity.setMobileTel(request.getMobileTel());
        if (request.getEmail() != null) entity.setEmail(request.getEmail());
        entity.setIsActive(true);
    }

    public PersonResponseDTO toResponseDTO(Person person) {
        if (person == null) {
            return null;
        }

        return PersonResponseDTO.builder()
            .id(person.getId())
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