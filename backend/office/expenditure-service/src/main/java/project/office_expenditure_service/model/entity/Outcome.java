package project.office_expenditure_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import project.office_expenditure_service.model.entity.base.AbstractAuditableEntity;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "outcomes")
public class Outcome extends AbstractAuditableEntity {

    @Column(name = "uid", unique = true, updatable = false)
    private UUID uid;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id", nullable = false)
    private OutcomeSubcategory subcategory;

    @Column(name = "default_price", precision = 12, scale = 4, nullable = false)
    private BigDecimal defaultPrice;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}
