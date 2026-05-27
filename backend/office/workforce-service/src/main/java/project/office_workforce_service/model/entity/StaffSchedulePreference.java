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
@Table(name = "staff_schedule_preferences", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"staff_id", "place_id", "week_day"})
})
public class StaffSchedulePreference extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @Column(name = "week_day", nullable = false)
    private Integer weekDay;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "working_period_id", nullable = false)
    private WorkingPeriod workingPeriod;

    @Builder.Default
    @Column(name = "priority_index")
    private Integer priorityIndex = 0;
}