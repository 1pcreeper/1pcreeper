package project.general_account_service.mapper;

import com.netflix.spectator.impl.StepDouble;
import org.springframework.stereotype.Component;
import project.general_account_service.model.dto.object.AppUserDTO;
import project.general_account_service.model.dto.response.AppUserVerifyResponseDTO;
import project.general_account_service.model.entity.AppUser;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AppUserMapper {
    public AppUserDTO toAppUserDTO(AppUser appUser) {
        if (appUser == null) {
            return null;
        }
        return AppUserDTO.builder()
            .id(appUser.getId())
            .uid(appUser.getUid())
            .name(appUser.getName())
            .displayName(appUser.getDisplayName())
            .email(appUser.getEmail())
            .roles(appUser.getRoles())
            .createdAt(appUser.getCreatedAt())
            .updatedAt(appUser.getUpdatedAt())
            .build();
    }
    public AppUserVerifyResponseDTO toAppUserVerifyResponseDTO(AppUser appUser, Set<String> roles){
        if (appUser == null || roles == null) {
            return null;
        }

        Set<String> combinedRoles = new HashSet<>();
        Set<String> appUserRoles = appUser.getRoles().stream().map(Enum::name).collect(Collectors.toSet());
        combinedRoles.addAll(appUserRoles);
        combinedRoles.addAll(roles);
        
        
        return AppUserVerifyResponseDTO.builder()
            .id(appUser.getId())
            .uid(appUser.getUid())
            .name(appUser.getName())
            .displayName(appUser.getDisplayName())
            .email(appUser.getEmail())
            .roles(combinedRoles)
            .createdAt(appUser.getCreatedAt())
            .updatedAt(appUser.getUpdatedAt())
            .build();
    }
}
