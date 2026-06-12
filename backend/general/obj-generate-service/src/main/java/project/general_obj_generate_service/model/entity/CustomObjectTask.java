package project.general_obj_generate_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import project.general_obj_generate_service.model.entity.base.AbstractAuditableEntity;
import project.general_obj_generate_service.model.entity.enums.ProjectStatus;
import project.general_obj_generate_service.model.entity.enums.ResourceType;

import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Table(name = "custom_object_tasks")
public class CustomObjectTask extends AbstractAuditableEntity {

    @Column(name = "task_id", unique = true, nullable = false, updatable = false)
    private UUID taskId = UUID.randomUUID();

    @Column(name = "project_id", nullable = false)
    private Integer projectId;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ProjectStatus status = ProjectStatus.PENDING;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "generation_source_type", nullable = false)
    private ResourceType generationSourceType;

    @Column(name = "text_prompt", columnDefinition = "TEXT")
    private String textPrompt;

    @Column(name = "source_resource_id")
    private Integer sourceResourceId;

    @Column(name = "resulting_object_id")
    private Integer resultingObjectId;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}