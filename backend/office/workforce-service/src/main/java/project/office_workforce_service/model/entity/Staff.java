package project.office_workforce_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import project.office_workforce_service.model.entity.base.AbstractAuditableEntity;
import project.office_workforce_service.model.entity.enums.WorkType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "staffs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"company_id", "person_id"})
})
public class Staff extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    private Organization org;

    @Column(name = "cust_id", columnDefinition = "TEXT")
    private String custId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "type", nullable = false)
    private WorkType type;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}