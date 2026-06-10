package project.general_obj_generate_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.general_obj_generate_service.model.entity.ProjectResource;
import project.general_obj_generate_service.model.entity.enums.ResourceType;
import project.general_obj_generate_service.repository.ProjectResourceRepository;
import project.general_obj_generate_service.service.base.AbstractBaseService;

@Service
public class ProjectResourceManagerService extends AbstractBaseService<ProjectResource, Long> {

    private final ProjectResourceRepository projectResourceRepository;

    @Autowired
    public ProjectResourceManagerService(ProjectResourceRepository projectResourceRepository) {
        super(projectResourceRepository, "ProjectResource");
        this.projectResourceRepository = projectResourceRepository;
    }

    public Page<ProjectResource> searchResources(Long projectId, ResourceType resourceType, String fileName, Pageable pageable) {
        return projectResourceRepository.searchResources(projectId, resourceType, fileName, pageable);
    }
}