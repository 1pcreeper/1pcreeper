package project.general_account_service.controller.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.general_account_service.mapper.AppUserMapper;
import project.general_account_service.model.dto.base.APIBaseResponseDTO;
import project.general_account_service.model.dto.object.AppUserDTO;
import project.general_account_service.model.entity.AppUser;

import java.util.Objects;


@RestController
@RequestMapping(path = "/auth")
public class AuthController {
    private final AppUserMapper appUserMapper;
    @Autowired
    public AuthController(AppUserMapper appUserMapper) {
        this.appUserMapper = appUserMapper;
    }
    @GetMapping("/hello")
    public String echoHello(){
        return "Hello";
    }
    @GetMapping("/verify")
    public ResponseEntity<APIBaseResponseDTO<AppUserDTO>> verify(@AuthenticationPrincipal AppUser appUser){
        if(Objects.isNull(appUser)){
             throw new AuthorizationDeniedException("User Not Verified");
        }
        return ResponseEntity.ok().body(
            APIBaseResponseDTO.success(
                appUserMapper.toAppUserDTO(appUser)
            )
        );
    }
}
