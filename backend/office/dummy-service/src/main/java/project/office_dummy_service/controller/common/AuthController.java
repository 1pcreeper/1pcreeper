package project.office_dummy_service.controller.common;

import com.google.api.Http;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import project.office_dummy_service.constant.UserRoles;
import project.office_dummy_service.mapper.UserMapper;
import project.office_dummy_service.model.dto.response.UserVerifyResponseDTO;
import project.office_dummy_service.model.entity.User;
import project.office_dummy_service.model.entity.enums.UserRole;
import project.shared_office_common_lib.constant.CookieKeyConstant;
import project.shared_office_common_lib.properties.HttpProperties;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.service.auth.PrincipalAuthService;

import java.security.Principal;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;


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
    

    @Secured({UserRoles.OFFICE_USER})
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
