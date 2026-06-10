package project.general_obj_generate_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.general_obj_generate_service.model.entity.ProjectShare;
import project.general_obj_generate_service.model.entity.enums.AccessLevel;
import project.general_obj_generate_service.repository.ProjectShareRepository;
import project.general_obj_generate_service.service.base.AbstractBaseService;
import project.shared_general_starter.model.exception.ResourceNotFoundException;

@Service
public class ProjectShareManagerService extends AbstractBaseService<ProjectShare, Long> {

    private final ProjectShareRepository projectShareRepository;

    @Autowired
    public ProjectShareManagerService(ProjectShareRepository projectShareRepository) {
        super(projectShareRepository, "ProjectShare");
        this.projectShareRepository = projectShareRepository;
    }

    public Page<ProjectShare> searchCollaborators(Long projectId, AccessLevel accessLevel, Pageable pageable) {
        return projectShareRepository.searchCollaborators(projectId, accessLevel, pageable);
    }

    public ProjectShare findByProjectIdAndUserId(Long projectId, Long userId) {
        return projectShareRepository.findByProjectIdAndUserId(projectId, userId).orElseThrow(
            () -> new ResourceNotFoundException("Project share not found for User ID: " + userId + " on Project ID: " + projectId)
        );
    }
}