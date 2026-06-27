package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.object.PersonDetailDTO;
import project.office_workforce_service.model.dto.object.StaffDetailDTO;
import project.office_workforce_service.model.entity.PersonDetail;
import project.office_workforce_service.model.entity.StaffDetail;

import java.time.LocalDateTime;

@Component
public class PersonDetailMapper {
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
