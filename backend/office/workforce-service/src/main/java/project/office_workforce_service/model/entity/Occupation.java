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
@Table(name = "occupations")
public class Occupation extends AbstractAuditableEntity {

    @Column(columnDefinition = "TEXT", nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    private Organization org;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}