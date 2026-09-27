package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.object.PersonDetailDTO;
import project.office_workforce_service.model.dto.object.StaffDetailDTO;
import project.office_workforce_service.model.dto.response.PersonDetailResponseDTO;
import project.office_workforce_service.model.entity.Person;
import project.office_workforce_service.model.entity.PersonDetail;
import project.office_workforce_service.model.entity.StaffDetail;

import java.time.LocalDateTime;

@Component
public class PersonDetailMapper {
    
    public void updateEntity(project.office_workforce_service.model.dto.request.PersonUpdateRequestDTO request, PersonDetail entity) {
        if (request == null || entity == null) return;
        if (request.getBio() != null) entity.setBio(emptyToNull(request.getBio()));
        if (request.getDateOfBirth() != null) entity.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) entity.setGender(request.getGender());
        if (request.getNationality() != null) entity.setNationality(emptyToNull(request.getNationality()));
        if (request.getOccupation() != null) entity.setOccupation(emptyToNull(request.getOccupation()));
        if (request.getAddress() != null) entity.setAddress(emptyToNull(request.getAddress()));
        if (request.getWechatId() != null) entity.setWechatId(emptyToNull(request.getWechatId()));
        if (request.getInstagramId() != null) entity.setInstagramId(emptyToNull(request.getInstagramId()));
        if (request.getWebsite() != null) entity.setWebsite(emptyToNull(request.getWebsite()));
    }

    private String emptyToNull(String value) {
        if (value == null) return null;
        value = value.trim();
        return value.isEmpty() ? null : value;
    }

    public PersonDetailDTO tpPersonDetailDTO(PersonDetail personDetail) {
        if (personDetail == null) return null;
        return PersonDetailDTO.builder()
            .id(personDetail.getId())
            .personId(personDetail.getPerson() != null ? personDetail.getPerson().getId() : null)
            .bio(personDetail.getBio())
            .dateOfBirth(personDetail.getDateOfBirth())
            .gender(personDetail.getGender())
            .nationality(personDetail.getNationality())
            .occupation(personDetail.getOccupation())
            .address(personDetail.getAddress())
            .wechatId(personDetail.getWechatId())
            .instagramId(personDetail.getInstagramId())
            .website(personDetail.getWebsite())
            .createdAt(personDetail.getCreatedAt())
            .updatedAt(personDetail.getUpdatedAt())
            .build();
    }
}
