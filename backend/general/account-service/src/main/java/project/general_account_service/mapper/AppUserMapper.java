package project.general_account_service.mapper;

import org.springframework.stereotype.Component;
import project.general_account_service.model.dto.object.AppUserDTO;
import project.general_account_service.model.entity.AppUser;

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
}
