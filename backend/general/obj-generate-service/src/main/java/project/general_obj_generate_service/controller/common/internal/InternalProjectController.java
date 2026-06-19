package project.general_obj_generate_service.controller.common.internal;

import jakarta.annotation.security.PermitAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.general_obj_generate_service.model.dto.request.ProjectCreateCompletionRequestDTO;
import project.general_obj_generate_service.service.common.ObjProjectService;
import project.shared_general_starter.model.dto.base.APIBaseResponseDTO;

@PermitAll
@RestController
@RequestMapping("/internal/projects")
public class InternalProjectController {

    @Autowired
    private ObjProjectService objProjectService;

    @PermitAll
    @PatchMapping("/{projectId}/status")
    public ResponseEntity<APIBaseResponseDTO<Void>> handleGenerationComplete(
        @PathVariable Long projectId,
        @RequestBody ProjectCreateCompletionRequestDTO requestDTO
    ) {
        objProjectService.updateGenerationStatus(requestDTO,projectId);
        return ResponseEntity.ok().body(
            APIBaseResponseDTO.success(
                null
            )
        );
    }
}