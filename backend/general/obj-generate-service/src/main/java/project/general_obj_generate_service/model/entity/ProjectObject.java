package project.general_obj_generate_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import project.general_obj_generate_service.model.entity.base.AbstractAuditableEntity;
import project.general_obj_generate_service.model.entity.enums.SourceType;

import java.util.Map;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Table(name = "project_objects")
public class ProjectObject extends AbstractAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ObjProject project;

    @Column(name = "object_name", nullable = false)
    private String objectName;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "source_type", columnDefinition = "source_type", nullable = false)
    private SourceType sourceType;

    @Column(name = "raw_obj_url", columnDefinition = "TEXT")
    private String rawObjUrl;

    @Column(name = "view_glb_url", columnDefinition = "TEXT")
    private String viewGlbUrl;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "editor_state", columnDefinition = "jsonb")
    private Map<String, Object> editorState;
}