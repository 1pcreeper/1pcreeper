package project.general_obj_generate_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.general_obj_generate_service.model.entity.ProjectShare;
import project.general_obj_generate_service.model.entity.enums.AccessLevel;
import project.general_obj_generate_service.repository.base.AbstractBaseRepository;

import java.util.Optional;

@Repository
public interface ProjectShareRepository extends AbstractBaseRepository<ProjectShare, Long> {

    // List all collaborators on a project (optional filter by access level)
    @Query("SELECT s FROM ProjectShare s WHERE " +
        "s.project.id = :projectId AND " +
        "(:accessLevel IS NULL OR s.accessLevel = :accessLevel)")
    Page<ProjectShare> searchCollaborators(@Param("projectId") Long projectId,
                                           @Param("accessLevel") AccessLevel accessLevel,
                                           Pageable pageable);

    // Quick lookup to delete or update a specific user's access
    Optional<ProjectShare> findByProjectIdAndUserId(Long projectId, Long userId);
}