package project.general_obj_generate_service.controller.common;

import jakarta.annotation.security.PermitAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.general_obj_generate_service.constant.UserRoles;
import project.general_obj_generate_service.mapper.UserMapper;
import project.general_obj_generate_service.model.dto.response.UserVerifyResponseDTO;
import project.general_obj_generate_service.model.entity.User;
import project.shared_general_common_lib.constant.FirebaseClaimKeysConstant;
import project.shared_general_common_lib.constant.role.SystemRoles;
import project.shared_general_starter.model.dto.base.APIBaseResponseDTO;

import project.shared_general_starter.model.exception.PrincipalException;

import java.security.Principal;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;


@RestController
@RequestMapping(path = "/auth")
public class AuthController {
    private final UserMapper userMapper;
    @Autowired
    public AuthController(
        UserMapper userMapper
    ) {
        this.userMapper = userMapper;
    }
    @PermitAll
    @GetMapping("/hello")
    public String echoHello() {
        return "Hello";
    }
    @GetMapping("/verify")
    public ResponseEntity<APIBaseResponseDTO<UserVerifyResponseDTO>> verify(
        @AuthenticationPrincipal User user
    ){
        if(Objects.isNull(user)){
             throw new AuthorizationDeniedException("User Not Verified");
        }
        return ResponseEntity.ok().body(
            APIBaseResponseDTO.success(
                userMapper.toUserVerifyResponseDTO(user,new HashSet<>())
            )
        );
    }
}
