package project.general_dummy_service.controller.common;

import jakarta.annotation.security.PermitAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.general_dummy_service.mapper.UserMapper;
import project.general_dummy_service.model.dto.response.UserVerifyResponseDTO;
import project.general_dummy_service.model.entity.User;
import project.shared_general_starter.model.dto.base.APIBaseResponseDTO;

import java.util.HashSet;
import java.util.Objects;


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
