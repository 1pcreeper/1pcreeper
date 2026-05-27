package project.office_account_service.controller.common;

import com.google.api.Http;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import project.office_account_service.mapper.OfficeUserMapper;
import project.office_account_service.model.dto.request.AuthLoginRequestDTO;
import project.office_account_service.model.dto.request.AuthRegisterRequestDTO;
import project.office_account_service.model.dto.response.AuthTokenResponseDTO;
import project.office_account_service.model.dto.response.OfficeUserVerifyResponseDTO;
import project.office_account_service.model.entity.OfficeUser;
import project.office_account_service.service.common.AccountService;
import project.shared_office_common_lib.constant.CookieKeyConstant;
import project.shared_office_common_lib.properties.HttpProperties;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.service.auth.PrincipalAuthService;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;


@RestController
@RequestMapping(path = "/auth")
public class AuthController {
    private final OfficeUserMapper officeUserMapper;
    private final AccountService accountService;
    private final HttpProperties httpProperties;
    private final PrincipalAuthService principalAuthService;

    @Autowired
    public AuthController(
        OfficeUserMapper officeUserMapper,
        AccountService accountService,
        HttpProperties httpProperties,
        PrincipalAuthService principalAuthService
    ) {
        this.officeUserMapper = officeUserMapper;
        this.accountService = accountService;
        this.httpProperties = httpProperties;
        this.principalAuthService = principalAuthService;
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
        AuthTokenResponseDTO responseDTO = accountService.register(requestDTO);
        ResponseCookie cookie = ResponseCookie.from(CookieKeyConstant.SECURE, responseDTO.getToken())
            .secure(httpProperties.getSecured())
            .httpOnly(httpProperties.getSecured())
            .sameSite("Lax")
            .path("/")
            .maxAge(36000)
            .build();
        return ResponseEntity
            .accepted()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(
                APIBaseResponseDTO.success(
                    responseDTO
                )
            );
    }

    @PermitAll
    @PostMapping("/login")
    public ResponseEntity<APIBaseResponseDTO<AuthTokenResponseDTO>> login(
        @Valid @RequestBody AuthLoginRequestDTO requestDTO
    ) {
        AuthTokenResponseDTO responseDTO = accountService.login(requestDTO);
        ResponseCookie cookie = ResponseCookie.from(CookieKeyConstant.SECURE, responseDTO.getToken())
            .secure(httpProperties.getSecured())
            .httpOnly(httpProperties.getSecured())
            .sameSite("Lax")
            .path("/")
            .maxAge(36000)
            .build();
        return ResponseEntity
            .accepted()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(
                APIBaseResponseDTO.success(
                    responseDTO
                )
            );
    }

    @PermitAll
    @GetMapping("/verify")
    public ResponseEntity<APIBaseResponseDTO<OfficeUserVerifyResponseDTO>> verify(
        @AuthenticationPrincipal OfficeUser officeUser
    ) {
        return ResponseEntity.ok(
            APIBaseResponseDTO.success(
                officeUserMapper.toOfficeUserVerifyResponseDTO(officeUser, new HashSet<>())
            )
        );
    }
}
