package project.office_expenditure_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import project.office_expenditure_service.model.entity.base.AbstractAuditableEntity;
import project.office_expenditure_service.model.entity.enums.IntervalPeriod;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "outcome_expenses")
public class OutcomeExpense extends AbstractAuditableEntity {

    @Column(name = "uid", unique = true, updatable = false)
    private UUID uid;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "outcome_id")
    private Outcome outcome;

    @Column(name = "cost", precision = 12, scale = 4, nullable = false)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "period", nullable = false)
    private IntervalPeriod period;

    @Column(name = "invoked_at", nullable = false)
    private LocalDateTime invokedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "company_id", nullable = false)
    private Long companyId;
}
