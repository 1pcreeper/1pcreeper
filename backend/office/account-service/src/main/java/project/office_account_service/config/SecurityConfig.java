package project.office_account_service.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import project.office_account_service.properties.JwtSecretProperties;
import project.shared_office_starter.converter.JwtAuthenticationConverter;
import project.shared_office_common_lib.constant.ServiceRegistryIDNames;
import project.shared_office_common_lib.properties.CorsProperties;
import project.shared_office_starter.handler.SpaCsrfTokenRequestHandler;
import project.shared_office_starter.resolver.AuthBearerTokenResolver;
import project.shared_office_starter.service.base.UserDetailsBaseService;

import javax.crypto.spec.SecretKeySpec;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Configuration
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
@EnableWebSecurity
public class SecurityConfig {
    private final UserDetailsBaseService userDetailsBaseService;
    private final SpaCsrfTokenRequestHandler spaCsrfTokenRequestHandler;
    private final CorsProperties corsProperties;
    private final JwtAuthenticationConverter jwtAuthenticationConverter;
    private final AuthBearerTokenResolver authBearerTokenResolver;
    private final JwtSecretProperties jwtSecretProperties;

    @Autowired
    public SecurityConfig(
        UserDetailsBaseService userDetailsBaseService,
        SpaCsrfTokenRequestHandler spaCsrfTokenRequestHandler,
        CorsProperties corsProperties,
        JwtAuthenticationConverter jwtAuthenticationConverter,
        AuthBearerTokenResolver authBearerTokenResolver,
        JwtSecretProperties jwtSecretProperties
    ) {
        this.userDetailsBaseService = userDetailsBaseService;
        this.spaCsrfTokenRequestHandler = spaCsrfTokenRequestHandler;
        this.corsProperties = corsProperties;
        this.jwtAuthenticationConverter = jwtAuthenticationConverter;
        this.authBearerTokenResolver = authBearerTokenResolver;
        this.jwtSecretProperties = jwtSecretProperties;
    }


    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer =
            OAuth2AuthorizationServerConfigurer.authorizationServer();
        http
            .userDetailsService(userDetailsBaseService)
            .securityMatcher(authorizationServerConfigurer.getEndpointsMatcher())
            .with(authorizationServerConfigurer, (authorizationServer) ->
                authorizationServer
                    .oidc(Customizer.withDefaults())
            )
            .cors(
                cors ->
                    cors.configurationSource(corsConfigurationSource())
            )
            .csrf(csrfCustomize())
            .authorizeHttpRequests((authorize) ->
                authorize
                    .anyRequest().permitAll()
            )
            .getConfigurer(OAuth2AuthorizationServerConfigurer.class)
            .oidc(Customizer.withDefaults());

        http.exceptionHandling((exceptions) -> exceptions
                .authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/auth/login"))
            )
            .oauth2ResourceServer((resourceServer) ->
                resourceServer.jwt(jwt ->
                        jwt
                            .jwtAuthenticationConverter(jwtAuthenticationConverter)
                    )
                    .bearerTokenResolver(authBearerTokenResolver));

        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrfCustomize())
            .cors(
                cors ->
                    cors.configurationSource(corsConfigurationSource())
            )
            .authorizeHttpRequests((authorize) -> authorize
                .anyRequest().permitAll()
            ).oauth2ResourceServer((resourceServer) ->
                resourceServer.jwt(jwt ->
                        jwt
                            .jwtAuthenticationConverter(jwtAuthenticationConverter)
                    )
                    .bearerTokenResolver(authBearerTokenResolver)
            );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient oidcClient = RegisteredClient.withId(UUID.randomUUID().toString())
            .clientId("oidc-client")
            .clientSecret(passwordEncoder().encode(jwtSecretProperties.getSecret()))
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
            .redirectUri("lb://" + ServiceRegistryIDNames.OFFICE_API_GATEWAY)
            .postLogoutRedirectUri("lb://" + ServiceRegistryIDNames.OFFICE_API_GATEWAY)
            .scope(OidcScopes.OPENID)
            .scope(OidcScopes.PROFILE)
            .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
            .build();

        return new InMemoryRegisteredClientRepository(oidcClient);
    }

    @Bean
    public KeyPair keyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            return keyPairGenerator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate RSA key pair", ex);
        }
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource(KeyPair keyPair) {
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
            .privateKey(privateKey)
            .keyID(UUID.randomUUID().toString())
            .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }

    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
            .jwkSetEndpoint("/oauth2/jwks")
            .build();
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


    private Customizer<CsrfConfigurer<HttpSecurity>> csrfCustomize() {
        return csrf ->
            csrf
                .ignoringRequestMatchers(
                    "/auth/**"
                )
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(spaCsrfTokenRequestHandler);
    }
}