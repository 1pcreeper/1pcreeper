package project.general_api_gateway.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoders;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import project.general_api_gateway.service.auth.UserDetailsAuthService;
import project.shared_general_common_lib.properties.CorsProperties;
import project.shared_general_common_lib.properties.JwtProperties;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebFluxSecurity // 注意：改用 WebFluxSecurity
public class SecurityConfig {
    private final CorsProperties corsProperties;
    private final JwtProperties jwtProperties;

    @Autowired
    public SecurityConfig(
        CorsProperties corsProperties,
        JwtProperties jwtProperties
    ) {
        this.corsProperties = corsProperties;
        this.jwtProperties = jwtProperties;
    }

    // 在 WebFlux 中要使用 ReactiveJwtDecoder
    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        return ReactiveJwtDecoders.fromIssuerLocation(jwtProperties.getIssuerUri());
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
            )
            .authorizeExchange(exchange -> exchange
                .anyExchange().permitAll() 
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(corsProperties.getAllowedOrigins()));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}