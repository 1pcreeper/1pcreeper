package project.office_transport_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import project.office_transport_service.model.entity.base.AbstractAuditableEntity;
import project.office_transport_service.model.entity.enums.VrdSubmissionStatus;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "vrd_submissions")
public class VrdSubmission extends AbstractAuditableEntity {

    @Column(name = "uid", unique = true, updatable = false, nullable = false)
    private UUID uid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "file_key", columnDefinition = "TEXT", nullable = false)
    private String fileKey;

    @Column(name = "sha256", length = 64, nullable = false)
    private String sha256;

    @Column(name = "byte_size", nullable = false)
    private Long byteSize;

    @Column(name = "media_type", length = 100, nullable = false)
    private String mediaType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ocr_raw_data", columnDefinition = "jsonb")
    private Map<String, Object> ocrRawData;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    private VrdSubmissionStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "decline_reason", columnDefinition = "TEXT")
    private String declineReason;
}
