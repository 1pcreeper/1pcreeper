package project.office_account_service.mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import project.office_account_service.model.dto.object.OfficeUserDTO;
import project.office_account_service.model.dto.request.AuthLoginRequestDTO;
import project.office_account_service.model.dto.request.AuthRegisterRequestDTO;
import project.office_account_service.model.dto.response.AuthTokenResponseDTO;
import project.office_account_service.model.dto.response.OfficeUserVerifyResponseDTO;
import project.office_account_service.model.entity.OfficeUser;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class OfficeUserMapper {
    private final PasswordEncoder passwordEncoder;
    @Autowired
    public OfficeUserMapper(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public OfficeUser toOfficeUser(AuthRegisterRequestDTO requestDTO){
        return OfficeUser.builder()
            .name(requestDTO.getName().trim().toLowerCase())
            .displayName(requestDTO.getDisplayName().trim())
            .password(passwordEncoder.encode(requestDTO.getPassword()))
            .build();
    }
    public OfficeUser toOfficeUser(AuthLoginRequestDTO requestDTO){
        return OfficeUser.builder()
            .name(requestDTO.getName().trim().toLowerCase())
            .password(passwordEncoder.encode(requestDTO.getPassword()))
            .build();
    }
    public OfficeUserDTO toOfficeUserDTO(OfficeUser officeUser) {
        if (officeUser == null) {
            return null;
        }
        return OfficeUserDTO.builder()
            .id(officeUser.getId())
            .uid(officeUser.getUid())
            .name(officeUser.getName())
            .displayName(officeUser.getDisplayName())
            .email(officeUser.getEmail())
            .roles(officeUser.getRoles())
            .createdAt(officeUser.getCreatedAt())
            .updatedAt(officeUser.getUpdatedAt())
            .build();
    }
    public OfficeUserVerifyResponseDTO toOfficeUserVerifyResponseDTO(OfficeUser officeUser, Set<String> roles){
        if (officeUser == null || roles == null) {
            return null;
        }

        Set<String> combinedRoles = new HashSet<>();
        Set<String> officeUserRoles = officeUser.getRoles().stream().map(Enum::name).collect(Collectors.toSet());
        combinedRoles.addAll(officeUserRoles);
        combinedRoles.addAll(roles);
        
        
        return OfficeUserVerifyResponseDTO.builder()
            .id(officeUser.getId())
            .uid(officeUser.getUid())
            .name(officeUser.getName())
            .displayName(officeUser.getDisplayName())
            .email(officeUser.getEmail())
            .roles(combinedRoles)
            .createdAt(officeUser.getCreatedAt())
            .updatedAt(officeUser.getUpdatedAt())
            .build();
    }
    
    public AuthTokenResponseDTO toAuthTokenResponseDTO(OfficeUser officeUser,String token){
        return AuthTokenResponseDTO.builder()
            .id(officeUser.getId())
            .uid(officeUser.getUid())
            .name(officeUser.getName())
            .displayName(officeUser.getDisplayName())
            .email(officeUser.getEmail())
            .token(token)
            .build();
    }
}
