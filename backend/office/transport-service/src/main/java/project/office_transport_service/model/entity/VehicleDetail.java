package project.office_transport_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import project.office_transport_service.model.entity.base.AbstractAuditableEntity;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "vehicle_details")
public class VehicleDetail extends AbstractAuditableEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false, unique = true)
    private Vehicle vehicle;

    @Column(name = "insurance_policy_number", length = 100)
    private String insurancePolicyNumber;

    @Column(name = "insurance_company", length = 150)
    private String insuranceCompany;

    @Column(name = "insurance_expiry_date")
    private LocalDate insuranceExpiryDate;

    @Column(name = "first_registration_date")
    private LocalDate firstRegistrationDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
