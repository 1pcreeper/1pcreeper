package project.office_transport_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import project.office_transport_service.model.entity.base.AbstractAuditableEntity;
import project.office_transport_service.model.entity.enums.FuelType;
import project.office_transport_service.model.entity.enums.VehicleClass;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "vehicles")
public class Vehicle extends AbstractAuditableEntity {

    @Column(name = "uid", unique = true, updatable = false, nullable = false)
    private UUID uid;

    @Column(name = "person_uid", nullable = false)
    private UUID personUid;

    @Column(name = "license_plate", length = 32, nullable = false)
    private String licensePlate;

    @Column(name = "make", length = 100, nullable = false)
    private String make;

    @Column(name = "model", length = 100, nullable = false)
    private String model;

    @Column(name = "year_of_manufacture")
    private Integer yearOfManufacture;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "chassis_number", length = 100)
    private String chassisNumber;

    @Column(name = "engine_number", length = 100)
    private String engineNumber;

    @Column(name = "engine_capacity_cc")
    private Integer engineCapacityCc;

    @Column(name = "seating_capacity")
    private Integer seatingCapacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", length = 50)
    private FuelType fuelType;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_class", length = 50)
    private VehicleClass vehicleClass;

    @Column(name = "vrd_expiry_date")
    private LocalDate vrdExpiryDate;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToOne(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private VehicleDetail vehicleDetail;
}
