package project.general_obj_generate_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.general_obj_generate_service.model.entity.ProjectResource;
import project.general_obj_generate_service.model.entity.enums.ResourceType;
import project.general_obj_generate_service.repository.base.AbstractBaseRepository;

@Repository
public interface ProjectResourceRepository extends AbstractBaseRepository<ProjectResource, Long> {

    @Query("SELECT r FROM ProjectResource r WHERE " +
        "r.project.id = :projectId AND " +
        "(:resourceType IS NULL OR r.resourceType = :resourceType) AND " +
        "(:fileName IS NULL OR LOWER(r.fileName) LIKE LOWER(CONCAT('%', :fileName, '%')))")
    Page<ProjectResource> searchResources(@Param("projectId") Long projectId,
                                          @Param("resourceType") ResourceType resourceType,
                                          @Param("fileName") String fileName,
                                          Pageable pageable);
}