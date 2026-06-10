package project.general_obj_generate_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.general_obj_generate_service.model.entity.ProjectObject;
import project.general_obj_generate_service.model.entity.enums.SourceType;
import project.general_obj_generate_service.repository.ProjectObjectRepository;
import project.general_obj_generate_service.service.base.AbstractBaseService;

@Service
public class ProjectObjectManagerService extends AbstractBaseService<ProjectObject, Long> {

    private final ProjectObjectRepository projectObjectRepository;

    @Autowired
    public ProjectObjectManagerService(ProjectObjectRepository projectObjectRepository) {
        super(projectObjectRepository, "ProjectObject");
        this.projectObjectRepository = projectObjectRepository;
    }

    public Page<ProjectObject> searchSceneObjects(Long projectId, String q, SourceType sourceType, Pageable pageable) {
        return projectObjectRepository.searchSceneObjects(projectId, q, sourceType, pageable);
    }
}