package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.object.UserDTO;
import project.office_workforce_service.model.dto.response.UserVerifyResponseDTO;
import project.office_workforce_service.model.entity.User;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {
    public UserDTO toUserDTO(User user) {
        if (user == null) {
            return null;
        }
        return UserDTO.builder()
            .id(user.getId())
            .uid(user.getUid())
            .roles(user.getRoles())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
    public UserVerifyResponseDTO toUserVerifyResponseDTO(User user, Set<String> roles){
        if (user == null || roles == null) {
            return null;
        }

        Set<String> combinedRoles = new HashSet<>();
        Set<String> userRoles = user.getRoles().stream().map(Enum::name).collect(Collectors.toSet());
        combinedRoles.addAll(userRoles);
        if(!roles.isEmpty()){
            combinedRoles.addAll(roles);
        }
        
        return UserVerifyResponseDTO.builder()
            .id(user.getId())
            .uid(user.getUid())
            .roles(combinedRoles)
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
