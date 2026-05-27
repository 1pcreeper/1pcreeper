package project.office_workforce_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import project.office_workforce_service.model.entity.base.AbstractAuditableEntity;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "companies")
public class Company extends AbstractAuditableEntity {

    @Column(name = "name_english")
    private String nameEnglish;

    @Column(name = "name_chinese")
    private String nameChinese;

    @Column(name = "business_registration_number", length = 50, unique = true)
    private String businessRegistrationNumber;

    @Column(name = "secretary_license_number", length = 20, unique = true)
    private String secretaryLicenseNumber;

    private String email;

    @Column(length = 50)
    private String tel;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}