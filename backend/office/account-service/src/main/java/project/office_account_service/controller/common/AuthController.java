package project.office_account_service.controller.common;

import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.office_account_service.mapper.OfficeUserMapper;
import project.office_account_service.model.dto.request.AuthLoginRequestDTO;
import project.office_account_service.model.dto.request.AuthRegisterRequestDTO;
import project.office_account_service.model.dto.response.AuthTokenResponseDTO;
import project.office_account_service.model.dto.response.OfficeUserVerifyResponseDTO;
import project.office_account_service.model.entity.OfficeUser;
import project.office_account_service.service.common.AccountService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;


@RestController
@RequestMapping(path = "/auth")
public class AuthController {
    private final OfficeUserMapper officeUserMapper;
    private final AccountService accountService;
    @Autowired
    public AuthController(
        OfficeUserMapper officeUserMapper,
        AccountService accountService
    ) {
        this.officeUserMapper = officeUserMapper;
        this.accountService = accountService;
    }
    @PermitAll
    @GetMapping("/hello")
    public String echoHello() {
        return "Hello";
    }
    @PermitAll
    @PostMapping("/register")
    public ResponseEntity<APIBaseResponseDTO<AuthTokenResponseDTO>> register(
        @Valid @RequestBody AuthRegisterRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(
            APIBaseResponseDTO.success(
                accountService.register(requestDTO)
            )
        );
    }
    @PermitAll
    @PostMapping("/login")
    public ResponseEntity<APIBaseResponseDTO<AuthTokenResponseDTO>> login(
        @Valid @RequestBody AuthLoginRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(
            APIBaseResponseDTO.success(
                accountService.login(requestDTO)
            )
        );
    }
}
