package project.office_expenditure_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import project.office_expenditure_service.model.entity.base.AbstractAuditableEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "staff_salaries", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"staff_id", "approved_at"})
})
public class StaffSalary extends AbstractAuditableEntity {

    @Column(name = "uid", unique = true, updatable = false)
    private UUID uid;

    @Column(name = "staff_id", nullable = false)
    private Long staffId;

    @Column(name = "amount", precision = 12, scale = 4, nullable = false)
    private BigDecimal amount;

    @Column(name = "approved_at", nullable = false)
    private LocalDateTime approvedAt;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}
