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
@Table(name = "place_occupation_rules", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"place_id", "occupation_id"})
})
public class PlaceOccupationRule extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occupation_id", nullable = false)
    private Occupation occupation;

    @Column(name = "person_count", nullable = false)
    private Integer personCount;
}