package project.general_obj_generate_service.controller.common;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import project.general_obj_generate_service.model.entity.ObjProject;
import project.general_obj_generate_service.model.entity.User;
import project.general_obj_generate_service.service.common.ObjProjectService;
import project.shared_general_starter.model.dto.base.APIBaseResponseDTO;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/projects") // Gateway prepends /api/v1/obj-generate
@RequiredArgsConstructor
public class ProjectController {

    private final ObjProjectService objProjectService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<APIBaseResponseDTO<Long>> handleProjectCreation(
        @AuthenticationPrincipal User user,
        @RequestParam("name") String name,
        @RequestParam(value = "prompt", required = false) String prompt,
        @RequestPart("referenceFiles") List<MultipartFile> referenceFiles) {
        
        String uid = user.getUid();

        log.info("📥 [API] Received new project request '{}' from user: {}", name, uid);
        
        ObjProject createdProject = objProjectService.createProject(uid, name, prompt, referenceFiles);

        // Return the new Project ID to the frontend so it can start polling the status or redirect to the editor page
        return ResponseEntity.ok().body(
            APIBaseResponseDTO.success(createdProject.getId())
        );
    }
}