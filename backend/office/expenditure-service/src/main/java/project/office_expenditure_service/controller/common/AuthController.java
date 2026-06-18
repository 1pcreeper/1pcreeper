package project.office_expenditure_service.controller.common;

import jakarta.annotation.security.PermitAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.office_expenditure_service.constant.UserRoles;
import project.office_expenditure_service.mapper.UserMapper;
import project.office_expenditure_service.model.dto.response.UserVerifyResponseDTO;
import project.office_expenditure_service.model.entity.User;
import project.shared_office_common_lib.properties.HttpProperties;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;

import java.util.*;


@RestController
@RequestMapping(path = "/auth")
public class AuthController {
    private final UserMapper userMapper;
    private final HttpProperties httpProperties;

    @Autowired
    public AuthController(
        UserMapper userMapper,
        HttpProperties httpProperties
    ) {
        this.userMapper = userMapper;
        this.httpProperties = httpProperties;
    }

    @PermitAll
    @GetMapping("/hello")
    public String echoHello() {
        return "Hello";
    }
    

    @Secured({UserRoles.EXPENDITURE_USER})
    @GetMapping("/verify")
    public ResponseEntity<APIBaseResponseDTO<UserVerifyResponseDTO>> verify(
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
            APIBaseResponseDTO.success(
                userMapper.toUserVerifyResponseDTO(user, new HashSet<>())
            )
        );
    }
}
