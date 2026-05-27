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
@Table(name = "persons")
public class Person extends AbstractAuditableEntity {

    @Column(name = "name_english")
    private String nameEnglish;

    @Column(name = "name_chinese")
    private String nameChinese;

    @Column(name = "office_tel", length = 50)
    private String officeTel;

    @Column(name = "mobile_tel", length = 50)
    private String mobileTel;

    @Column(name = "email")
    private String email;

    @Column(name = "hk_id", unique = true)
    private String hkId;

    @Column(name = "cn_id", unique = true)
    private String cnId;

    @Column(name = "mo_id", unique = true)
    private String moId;

    @Column(name = "passport_id")
    private String passportId;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}