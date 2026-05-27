package project.office_workforce_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import project.office_workforce_service.model.entity.User;

import java.util.Optional;

@Configuration
@EnableJpaAuditing
public class AuditorConfig {
    @Bean
    public AuditorAware<User> auditorProvider() {
        return new AuditorAware<User>() {
            @Override
            public Optional<User> getCurrentAuditor() {
                return Optional.ofNullable(SecurityContextHolder.getContext())
                    .map(SecurityContext::getAuthentication)
                    .filter(Authentication::isAuthenticated)
                    .map(Authentication::getPrincipal)
                    .map(principal -> principal instanceof User ? (User) principal : null);
            }
        };
    }
}