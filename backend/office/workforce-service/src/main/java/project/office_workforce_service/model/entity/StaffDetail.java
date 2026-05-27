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
@Table(name = "staff_details")
public class StaffDetail extends AbstractAuditableEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false, unique = true)
    private Staff staff;

    @Column(name = "max_working_hrs", nullable = false)
    private Integer maxWorkingHrs;
}