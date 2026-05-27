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
@Table(name = "staff_occupations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"staff_id", "occupation_id"})
})
public class StaffOccupation extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occupation_id", nullable = false)
    private Occupation occupation;

    @Column(columnDefinition = "TEXT")
    private String remark;
}