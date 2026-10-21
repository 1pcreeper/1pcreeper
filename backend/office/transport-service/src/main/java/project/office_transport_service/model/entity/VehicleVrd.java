package project.office_transport_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import project.office_transport_service.model.entity.base.AbstractAuditableEntity;
import project.office_transport_service.model.entity.enums.VrdStatus;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "vehicle_vrds")
public class VehicleVrd extends AbstractAuditableEntity {

    @Column(name = "uid", unique = true, updatable = false, nullable = false)
    private UUID uid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "document_number", length = 100)
    private String documentNumber;

    @Column(name = "registration_mark", length = 50, nullable = false)
    private String registrationMark;

    @Column(name = "registered_owner_name", length = 255)
    private String registeredOwnerName;

    @Column(name = "registered_owner_address", columnDefinition = "TEXT")
    private String registeredOwnerAddress;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "file_key", columnDefinition = "TEXT", nullable = false)
    private String fileKey;

    @Column(name = "sha256", length = 64, nullable = false)
    private String sha256;

    @Column(name = "byte_size", nullable = false)
    private Long byteSize;

    @Column(name = "media_type", length = 100, nullable = false)
    private String mediaType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    private VrdStatus status;
}
