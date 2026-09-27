package project.office_workforce_service.controller.common;

import jakarta.annotation.security.PermitAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.mapper.UserMapper;
import project.office_workforce_service.model.dto.response.UserVerifyResponseDTO;
import project.office_workforce_service.model.entity.User;
import project.shared_office_common_lib.constant.JwtClaimKeysConstant;
import project.shared_office_common_lib.properties.HttpProperties;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.service.auth.PrincipalAuthService;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;


@RestController
@RequestMapping(path = "/auth")
public class AuthController {
    private final UserMapper userMapper;
    private final HttpProperties httpProperties;
    private final PrincipalAuthService principalAuthService;

    @Autowired
    public AuthController(
        UserMapper userMapper,
        HttpProperties httpProperties,
        PrincipalAuthService principalAuthService
    ) {
        this.userMapper = userMapper;
        this.httpProperties = httpProperties;
        this.principalAuthService = principalAuthService;
    }

    @PermitAll
    @GetMapping("/hello")
    public String echoHello() {
        return "Hello";
    }
    
    @GetMapping("/verify")
    public ResponseEntity<APIBaseResponseDTO<UserVerifyResponseDTO>> verify(
        @AuthenticationPrincipal User user, Authentication authentication
    ) {
        Set<String> roleClaimNames;
        try{
            List<GrantedAuthority> roleClaims = (List<GrantedAuthority>) authentication.getAuthorities();
            roleClaimNames = roleClaims.stream().map(rc->rc.getAuthority()).collect(Collectors.toSet());
        } catch (RuntimeException e) {
            roleClaimNames = Set.of();
        }
        return ResponseEntity.ok(
            APIBaseResponseDTO.success(
                userMapper.toUserVerifyResponseDTO(user,roleClaimNames)
            )
        );
    }
}
