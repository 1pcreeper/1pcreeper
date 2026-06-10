package project.general_obj_generate_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.general_obj_generate_service.model.entity.ProjectObject;
import project.general_obj_generate_service.model.entity.enums.SourceType;
import project.general_obj_generate_service.repository.base.AbstractBaseRepository;

@Repository
public interface ProjectObjectRepository extends AbstractBaseRepository<ProjectObject, Long> {

    @Query("SELECT o FROM ProjectObject o WHERE " +
        "o.project.id = :projectId AND " +
        "(:q IS NULL OR LOWER(o.objectName) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
        "(:sourceType IS NULL OR o.sourceType = :sourceType)")
    Page<ProjectObject> searchSceneObjects(@Param("projectId") Long projectId,
                                           @Param("q") String q,
                                           @Param("sourceType") SourceType sourceType,
                                           Pageable pageable);
}