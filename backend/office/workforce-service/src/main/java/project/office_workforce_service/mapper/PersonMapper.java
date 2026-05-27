package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.PersonCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PersonUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PersonDetailResponseDTO;
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
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
    }

    public PersonResponseDTO toResponseDTO(Person person, PersonDetail detail) {
        if (person == null) {
            return null;
        }

        PersonDetailResponseDTO detailResponse = null;
        if (detail != null) {
            detailResponse = PersonDetailResponseDTO.builder()
                .bio(detail.getBio())
                .dateOfBirth(detail.getDateOfBirth())
                .gender(detail.getGender())
                .nationality(detail.getNationality())
                .occupation(detail.getOccupation())
                .address(detail.getAddress())
                .wechatId(detail.getWechatId())
                .instagramId(detail.getInstagramId())
                .website(detail.getWebsite())
                .build();
        }

        return PersonResponseDTO.builder()
            .id(person.getId())
            .nameEnglish(person.getNameEnglish())
            .nameChinese(person.getNameChinese())
            .email(person.getEmail())
            .mobileTel(person.getMobileTel())
            .hkId(person.getHkId())
            .isActive(person.getIsActive())
            .details(detailResponse)
            .build();
    }
}