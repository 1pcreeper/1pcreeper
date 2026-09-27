package project.office_workforce_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import project.office_workforce_service.model.entity.base.AbstractAuditableEntity;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "occupations")
public class Occupation extends AbstractAuditableEntity {
    
    @Column(name = "uid", unique = true, updatable = false)
    private UUID uid;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depart_id", nullable = false)
    private Department department;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}