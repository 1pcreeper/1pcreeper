package project.shared_general_starter.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import project.shared_general_common_lib.properties.CorsProperties;
import project.shared_general_common_lib.properties.JwtProperties;
import project.shared_general_starter.handler.SpaCsrfTokenRequestHandler;
import project.shared_general_starter.converter.JwtAuthenticationConverter;
import project.shared_general_starter.resolver.AuthBearerTokenResolver;
import project.shared_general_starter.service.base.UserDetailsBaseService;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfig {
    private final JwtProperties jwtProperties;
    private final CorsProperties corsProperties;
    private final AuthBearerTokenResolver authBearerTokenResolver;
    private final UserDetailsBaseService userDetailsBaseService;
    private final JwtAuthenticationConverter jwtAuthenticationConverter;
    private final SpaCsrfTokenRequestHandler spaCsrfTokenRequestHandler;
    @Autowired
    public SecurityConfig(
        JwtProperties jwtProperties,
        CorsProperties corsProperties,
        AuthBearerTokenResolver authBearerTokenResolver,
        UserDetailsBaseService userDetailsBaseService,
        JwtAuthenticationConverter jwtAuthenticationConverter,
        SpaCsrfTokenRequestHandler spaCsrfTokenRequestHandler
    ) {
        this.jwtProperties = jwtProperties;
        this.corsProperties = corsProperties;
        this.authBearerTokenResolver = authBearerTokenResolver;
        this.userDetailsBaseService = userDetailsBaseService;
        this.jwtAuthenticationConverter = jwtAuthenticationConverter;
        this.spaCsrfTokenRequestHandler = spaCsrfTokenRequestHandler;
    }

    @Bean
    public SecurityFilterChain securityWebFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors ->
                cors.configurationSource(corsConfigurationSource())
            )
            .csrf(csrf ->
                csrf
                    .ignoringRequestMatchers(
                        "/auth/hello"
                    )
                    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                    .csrfTokenRequestHandler(spaCsrfTokenRequestHandler)
            )
            .authorizeHttpRequests(auth ->
                auth.anyRequest().permitAll()
            ).oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt ->
                    jwt.
                        decoder(jwtDecoder())
                        .jwtAuthenticationConverter(jwtAuthenticationConverter)
                )
                .bearerTokenResolver(authBearerTokenResolver)
            ).userDetailsService(
                userDetailsBaseService
            );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = JwtDecoders.fromIssuerLocation(jwtProperties.getIssuerUri());

        OAuth2TokenValidator<Jwt> withClockSkew = new DelegatingOAuth2TokenValidator<>(
            new JwtTimestampValidator(Duration.ofSeconds(60)),
            new JwtIssuerValidator(jwtProperties.getIssuerUri())
        );
        jwtDecoder.setJwtValidator(withClockSkew);

        return jwtDecoder;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(corsProperties.getAllowedOriginsArray())); // Allow specific origins
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")); // Allow HTTP methods
        configuration.setAllowedHeaders(List.of("*")); // Allow all headers
        configuration.setAllowCredentials(true); // Allow cookies or Authorization headers

        return new CorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                return configuration;
            }
        };
    }
}
