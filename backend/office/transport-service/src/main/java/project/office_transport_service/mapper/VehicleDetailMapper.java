package project.office_transport_service.mapper;

import org.springframework.stereotype.Component;
import project.office_transport_service.model.dto.object.VehicleDetailDTO;
import project.office_transport_service.model.dto.request.VehicleCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleUpdateRequestDTO;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.model.entity.VehicleDetail;

@Component
public class VehicleDetailMapper {

    private String emptyToNull(String value) {
        if (value == null) return null;
        value = value.trim();
        return value.isEmpty() ? null : value;
    }

    public VehicleDetail toEntity(VehicleCreateRequestDTO request, Vehicle vehicle) {
        if (request == null) return null;

        return VehicleDetail.builder()
            .vehicle(vehicle)
            .insurancePolicyNumber(emptyToNull(request.getInsurancePolicyNumber()))
            .insuranceCompany(emptyToNull(request.getInsuranceCompany()))
            .insuranceExpiryDate(request.getInsuranceExpiryDate())
            .firstRegistrationDate(request.getFirstRegistrationDate())
            .notes(emptyToNull(request.getNotes()))
            .build();
    }

    public void updateEntity(VehicleUpdateRequestDTO request, VehicleDetail entity) {
        if (request == null || entity == null) return;

        if (request.getInsurancePolicyNumber() != null) {
            entity.setInsurancePolicyNumber(emptyToNull(request.getInsurancePolicyNumber()));
        }
        if (request.getInsuranceCompany() != null) {
            entity.setInsuranceCompany(emptyToNull(request.getInsuranceCompany()));
        }
        if (request.getInsuranceExpiryDate() != null) {
            entity.setInsuranceExpiryDate(request.getInsuranceExpiryDate());
        }
        if (request.getFirstRegistrationDate() != null) {
            entity.setFirstRegistrationDate(request.getFirstRegistrationDate());
        }
        if (request.getNotes() != null) {
            entity.setNotes(emptyToNull(request.getNotes()));
        }
    }

    public VehicleDetailDTO toDTO(VehicleDetail entity) {
        if (entity == null) return null;

        return VehicleDetailDTO.builder()
            .id(entity.getId())
            .vehicleId(entity.getVehicle() != null ? entity.getVehicle().getId() : null)
            .insurancePolicyNumber(entity.getInsurancePolicyNumber())
            .insuranceCompany(entity.getInsuranceCompany())
            .insuranceExpiryDate(entity.getInsuranceExpiryDate())
            .firstRegistrationDate(entity.getFirstRegistrationDate())
            .notes(entity.getNotes())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
