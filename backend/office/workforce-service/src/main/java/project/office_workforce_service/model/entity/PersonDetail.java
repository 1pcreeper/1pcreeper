package project.office_workforce_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import project.office_workforce_service.model.entity.base.AbstractAuditableEntity;
import project.office_workforce_service.model.entity.enums.Gender;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "person_details")
public class PersonDetail extends AbstractAuditableEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false, unique = true)
    private Person person;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String nationality;
    
    private String occupation;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "wechat_id", length = 50)
    private String wechatId;

    @Column(name = "instagram_id", length = 50)
    private String instagramId;

    @Column(columnDefinition = "TEXT")
    private String website;
}