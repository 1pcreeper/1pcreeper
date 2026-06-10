package project.general_obj_generate_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.general_obj_generate_service.model.entity.ObjProject;
import project.general_obj_generate_service.model.entity.enums.ProjectStatus;
import project.general_obj_generate_service.repository.base.AbstractBaseRepository;

@Repository
public interface ObjProjectRepository extends AbstractBaseRepository<ObjProject, Long> {

    // 1. Standard dynamic search (Admin or broad internal use)
    @Query("SELECT p FROM ObjProject p WHERE " +
        "(:q IS NULL OR " +
        "LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(p.prompt) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
        "(:status IS NULL OR p.status = :status)")
    Page<ObjProject> searchProjects(@Param("q") String q,
                                    @Param("status") ProjectStatus status,
                                    Pageable pageable);

    // 2. User Dashboard Search (Only returns owned projects OR whitelisted shared projects)
    @Query("SELECT DISTINCT p FROM ObjProject p " +
        "LEFT JOIN p.shares s " +
        "WHERE (p.createdBy.id = :userId OR s.user.id = :userId) AND " +
        "(:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
        "(:status IS NULL OR p.status = :status)")
    Page<ObjProject> searchAccessibleProjects(@Param("userId") Long userId,
                                              @Param("q") String q,
                                              @Param("status") ProjectStatus status,
                                              Pageable pageable);

    // 3. Lightning fast Edit Permission check (for the Auto-Save loop)
    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END " +
        "FROM obj_projects p " +
        "LEFT JOIN project_shares s ON p.id = s.project_id " +
        "WHERE p.id = :projectId " +
        "AND (p.created_by = :userId OR (s.user_id = :userId AND s.access_level = 'EDITOR'))",
        nativeQuery = true)
    boolean hasEditPermission(@Param("projectId") Long projectId, @Param("userId") Long userId);
}