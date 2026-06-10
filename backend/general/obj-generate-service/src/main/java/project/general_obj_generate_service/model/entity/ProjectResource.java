package project.general_obj_generate_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import project.general_obj_generate_service.model.entity.base.AbstractAuditableEntity;
import project.general_obj_generate_service.model.entity.enums.ResourceType;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Table(name = "project_resources")
public class ProjectResource extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ObjProject project;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "resource_type", columnDefinition = "resource_type", nullable = false)
    private ResourceType resourceType;

    @Column(name = "minio_url", nullable = false, columnDefinition = "TEXT")
    private String minioUrl;

    @Column(name = "file_name")
    private String fileName;
}