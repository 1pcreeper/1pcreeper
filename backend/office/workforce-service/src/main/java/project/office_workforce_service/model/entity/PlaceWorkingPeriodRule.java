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
@Table(name = "place_working_period_rules", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"occupation_rule_id", "working_period_id"})
})
public class PlaceWorkingPeriodRule extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occupation_rule_id", nullable = false)
    private PlaceOccupationRule occupationRule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "working_period_id", nullable = false)
    private WorkingPeriod workingPeriod;

    @Column(name = "person_count", nullable = false)
    private Integer personCount;
}