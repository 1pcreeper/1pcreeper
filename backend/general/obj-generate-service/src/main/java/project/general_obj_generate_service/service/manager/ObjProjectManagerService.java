package project.general_obj_generate_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.general_obj_generate_service.model.entity.ObjProject;
import project.general_obj_generate_service.model.entity.enums.ProjectStatus;
import project.general_obj_generate_service.repository.ObjProjectRepository;
import project.general_obj_generate_service.service.base.AbstractBaseService;

@Service
public class ObjProjectManagerService extends AbstractBaseService<ObjProject, Long> {

    private final ObjProjectRepository objProjectRepository;

    @Autowired
    public ObjProjectManagerService(ObjProjectRepository objProjectRepository) {
        super(objProjectRepository, "ObjProject");
        this.objProjectRepository = objProjectRepository;
    }

    public Page<ObjProject> searchProjects(String q, ProjectStatus status, Pageable pageable) {
        return objProjectRepository.searchProjects(q, status, pageable);
    }

    public Page<ObjProject> searchAccessibleProjects(Long userId, String q, ProjectStatus status, Pageable pageable) {
        return objProjectRepository.searchAccessibleProjects(userId, q, status, pageable);
    }

    public boolean hasEditPermission(Long projectId, Long userId) {
        return objProjectRepository.hasEditPermission(projectId, userId);
    }
}