package project.office_workforce_service.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.OrganizationDetail;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.util.Optional;

@Repository
public interface OrganizationDetailRepository extends AbstractBaseRepository<OrganizationDetail, Long> {

    @Query("SELECT od FROM OrganizationDetail od WHERE od.organization.id = :orgId")
    Optional<OrganizationDetail> findByOrgId(@Param("orgId")Long orgId);
}
