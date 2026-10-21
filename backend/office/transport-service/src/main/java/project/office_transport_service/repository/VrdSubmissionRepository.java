package project.office_transport_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_transport_service.model.entity.VrdSubmission;
import project.office_transport_service.model.entity.enums.VrdSubmissionStatus;
import project.office_transport_service.repository.base.AbstractBaseRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VrdSubmissionRepository extends AbstractBaseRepository<VrdSubmission, Long> {

    @Query("SELECT s FROM VrdSubmission s WHERE s.uid = :uid")
    Optional<VrdSubmission> findByUid(@Param("uid") UUID uid);

    @Query("SELECT s FROM VrdSubmission s WHERE s.status = :status ORDER BY s.createdAt ASC")
    List<VrdSubmission> findByStatus(@Param("status") VrdSubmissionStatus status);

    @Query("SELECT s FROM VrdSubmission s WHERE (:status IS NULL OR s.status = :status) ORDER BY s.createdAt DESC")
    Page<VrdSubmission> findByStatusPaged(@Param("status") VrdSubmissionStatus status, Pageable pageable);

    @Query("SELECT s FROM VrdSubmission s WHERE s.vehicle.id = :vehicleId ORDER BY s.createdAt DESC")
    List<VrdSubmission> findByVehicleId(@Param("vehicleId") Long vehicleId);

    @Query("SELECT s FROM VrdSubmission s WHERE s.vehicle.uid = :vehicleUid ORDER BY s.createdAt DESC")
    Page<VrdSubmission> findByVehicleUid(@Param("vehicleUid") UUID vehicleUid, Pageable pageable);

    @Query("SELECT COUNT(s) FROM VrdSubmission s WHERE s.status = 'PENDING'")
    long countPending();
}
