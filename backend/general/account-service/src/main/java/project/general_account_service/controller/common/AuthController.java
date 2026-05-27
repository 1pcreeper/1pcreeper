package project.general_account_service.controller.common;

import com.google.firebase.auth.FirebaseAuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.general_account_service.mapper.AppUserMapper;
import project.shared_general_common_lib.constant.CookieKeyConstant;
import project.shared_general_starter.model.dto.base.APIBaseResponseDTO;
import project.general_account_service.model.dto.object.AppUserDTO;
import project.general_account_service.model.dto.response.AppUserVerifyResponseDTO;
import project.general_account_service.model.entity.AppUser;
import project.shared_general_auth_starter.service.auth.FirebaseAuthService;
import project.shared_general_common_lib.constant.role.SystemRoles;
import project.shared_general_starter.model.exception.PrincipalException;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;


@RestController
@RequestMapping(path = "/auth")
public class AuthController {
    private final AppUserMapper appUserMapper;
    private final FirebaseAuthService firebaseAuthService;
    @Autowired
    public AuthController(
        AppUserMapper appUserMapper,
        FirebaseAuthService firebaseAuthService
    ) {
        this.appUserMapper = appUserMapper;
        this.firebaseAuthService = firebaseAuthService;
    }
    @GetMapping("/hello")
    public String echoHello() {
        return "Hello";
    }
    @GetMapping("/verify")
    public ResponseEntity<APIBaseResponseDTO<AppUserVerifyResponseDTO>> verify(
        @AuthenticationPrincipal AppUser appUser
    ){
        if(Objects.isNull(appUser)){
             throw new AuthorizationDeniedException("User Not Verified");
        }
        Set<String> systemRoles;
        try{
            systemRoles = firebaseAuthService.getRoles(appUser.getUid());
        }catch (FirebaseAuthException e){
            throw new PrincipalException("Failed to get System Roles info");
        }
        if(Objects.isNull(systemRoles)){
            systemRoles = new HashSet<>();
        }
        return ResponseEntity.ok().body(
            APIBaseResponseDTO.success(
                appUserMapper.toAppUserVerifyResponseDTO(appUser,systemRoles)
            )
        );
    }
}
