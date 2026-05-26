package project.office_account_service.service.common;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.stereotype.Service;
import project.office_account_service.constant.OfficeUserRoles;
import project.office_account_service.mapper.OfficeUserMapper;
import project.office_account_service.model.dto.request.AuthLoginRequestDTO;
import project.office_account_service.model.dto.request.AuthRegisterRequestDTO;
import project.office_account_service.model.dto.response.AuthTokenResponseDTO;
import project.office_account_service.model.entity.OfficeUser;
import project.office_account_service.service.manager.OfficeUserManagerService;
import project.shared_office_common_lib.constant.JwtClaimKeysConstant;
import project.shared_office_common_lib.constant.ServiceRegistryIDNames;
import project.shared_office_starter.model.exception.DatabaseUpdateFailureException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;
import project.shared_office_starter.model.exception.UnAuthorizedException;
import project.shared_office_starter.service.base.UserDetailsBaseService;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class AccountService {
    private final OfficeUserManagerService officeUserManagerService;
    private final OfficeUserMapper officeUserMapper;
    private final JwtEncoder jwtEncoder;
    private final RegisteredClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsBaseService userDetailsBaseService;
    public AccountService(
        OfficeUserManagerService officeUserManagerService,
        OfficeUserMapper officeUserMapper,
        JwtEncoder jwtEncoder,
        PasswordEncoder passwordEncoder,
        RegisteredClientRepository clientRepository,
        UserDetailsBaseService userDetailsBaseService
    ) {
        this.officeUserManagerService = officeUserManagerService;
        this.officeUserMapper = officeUserMapper;
        this.jwtEncoder = jwtEncoder;
        this.passwordEncoder = passwordEncoder;
        this.clientRepository = clientRepository;
        this.userDetailsBaseService = userDetailsBaseService;
    }

    public AuthTokenResponseDTO register(AuthRegisterRequestDTO requestDTO) {
        checkExistingOfficeUser(requestDTO.getName(), requestDTO.getPassword());
        OfficeUser newOfficeUser = officeUserMapper.toOfficeUser(requestDTO);
        newOfficeUser.setUid(UUID.randomUUID().toString());
        OfficeUser savedOfficeUser = officeUserManagerService.save(newOfficeUser);
        return null;
    }

    public AuthTokenResponseDTO login(AuthLoginRequestDTO requestDTO) {
        String name = requestDTO.getName().trim().toLowerCase();
        String password = passwordEncoder.encode(requestDTO.getPassword());
        
        OfficeUser existingOfficeUser = officeUserManagerService.findByName(name);
        if(!password.equals(existingOfficeUser.getPassword())){
            throw new UnAuthorizedException("Wrong User Name Or Password");
        }

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("office-account-service")
            .issuedAt(now)
            .expiresAt(now.plusSeconds(3600L))
            .subject(existingOfficeUser.getUid())
            .claim(JwtClaimKeysConstant.ROLE_KEY, List.of(OfficeUserRoles.OFFICE_USER))
            .build();

        String token = this.jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        
        return officeUserMapper.toAuthTokenResponseDTO(existingOfficeUser,token);
    }

    private void checkExistingOfficeUser(String name, String password) {
        try {
            if (Objects.nonNull(officeUserManagerService.findByName(name))) {
                throw new DatabaseUpdateFailureException("User Name Already existed");
            }
        } catch (ResourceNotFoundException e) {
            return;
        }
    }
}
