package project.general_obj_generate_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import project.general_obj_generate_service.model.entity.base.AbstractAuditableEntity;
import project.general_obj_generate_service.model.entity.enums.ProjectStatus;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Table(name = "object_texturing_tasks")
public class ObjectTexturingTask extends AbstractAuditableEntity {

    @Column(name = "task_id", unique = true, nullable = false, updatable = false)
    private UUID taskId = UUID.randomUUID();

    @Column(name = "project_id", nullable = false)
    private Integer projectId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status")
    private ProjectStatus status = ProjectStatus.PENDING;
    
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "target_object_ids", columnDefinition = "integer[]", nullable = false)
    private List<Integer> targetObjectIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "custom_texture_resource_ids", columnDefinition = "integer[]", nullable = false)
    private List<Integer> customTextureResourceIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "integer[]")
    private List<Integer> materialLibraryIds;

    // Mapping JSONB column
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> textureMapping;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}