package project.office_account_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
import org.springframework.transaction.annotation.Transactional;
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
import project.shared_office_starter.model.exception.RegisterFailureException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;
import project.shared_office_starter.model.exception.UnAuthorizedException;
import project.shared_office_starter.service.base.UserDetailsBaseService;

import java.time.Instant;
import java.util.*;

@Service
public class AccountService {
    private final OfficeUserManagerService officeUserManagerService;
    private final OfficeUserMapper officeUserMapper;
    private final JwtEncoder jwtEncoder;
    private final RegisteredClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsBaseService userDetailsBaseService;

    @Autowired
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

    @Transactional
    public AuthTokenResponseDTO register(AuthRegisterRequestDTO requestDTO) {
        checkExistingOfficeUser(requestDTO.getName(), requestDTO.getPassword());
        OfficeUser newOfficeUser = officeUserMapper.toOfficeUser(requestDTO);
        newOfficeUser.setUid(UUID.randomUUID().toString());
        newOfficeUser.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        OfficeUser savedOfficeUser = officeUserManagerService.save(newOfficeUser);
        JwtClaimsSet claimsSet = createJwtClaimsSet(savedOfficeUser);
        String token = this.jwtEncoder.encode(JwtEncoderParameters.from(claimsSet)).getTokenValue();
        return officeUserMapper.toAuthTokenResponseDTO(savedOfficeUser, token);
    }

    public AuthTokenResponseDTO login(AuthLoginRequestDTO requestDTO) {
        String name = requestDTO.getName().trim().toLowerCase();
        String password = requestDTO.getPassword();

        OfficeUser existingOfficeUser;
        try {
            existingOfficeUser = officeUserManagerService.findByName(name);
        } catch (UsernameNotFoundException e) {
            throw new UnAuthorizedException("Wrong User Name Or Password");
        }

        if (!passwordEncoder.matches(password, existingOfficeUser.getPassword())) {
            throw new UnAuthorizedException("Wrong User Name Or Password");
        }


        JwtClaimsSet claimsSet = createJwtClaimsSet(existingOfficeUser);

        String token = this.jwtEncoder.encode(JwtEncoderParameters.from(claimsSet)).getTokenValue();

        return officeUserMapper.toAuthTokenResponseDTO(existingOfficeUser, token);
    }

    private void checkExistingOfficeUser(String name, String password) {
        try {
            if (Objects.nonNull(officeUserManagerService.findByName(name))) {
                throw new RegisterFailureException("User Name Already existed");
            }
        } catch (UsernameNotFoundException e) {
            return;
        }
    }

    private JwtClaimsSet createJwtClaimsSet(OfficeUser officeUser) {
        Instant now = Instant.now();
        return JwtClaimsSet.builder()
            .issuer("office-account-service")
            .issuedAt(now)
            .expiresAt(now.plusSeconds(3600L))
            .subject(officeUser.getUid())
            .claim(JwtClaimKeysConstant.ROLE_KEY,
                officeUser.getRoles() == null ? new ArrayList<>() : officeUser.getRoles()
            )
            .build();
    }
}
