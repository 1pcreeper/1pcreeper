package project.office_workforce_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import project.office_workforce_service.model.entity.base.AbstractAuditableEntity;
import project.office_workforce_service.model.entity.enums.WorkType;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "place_schedule_rules")
public class PlaceScheduleRule extends AbstractAuditableEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false, unique = true)
    private Place place;

    @Column(name = "person_count", nullable = false)
    private Integer personCount;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "place_schedule_rule_work_types", joinColumns = @JoinColumn(name = "rule_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "work_type")
    private List<WorkType> workTypePriorities;
}