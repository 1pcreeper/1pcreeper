package project.office_expenditure_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import project.office_expenditure_service.model.entity.base.AbstractAuditableEntity;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "outcome_categories")
public class OutcomeCategory extends AbstractAuditableEntity {

    @Column(name = "uid", unique = true, updatable = false)
    private UUID uid;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String name;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}
