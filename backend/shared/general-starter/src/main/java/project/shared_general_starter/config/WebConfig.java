package project.shared_general_starter.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import project.shared_general_common_lib.properties.CorsProperties;
import project.shared_general_starter.interceptor.AuthInterceptor;
import project.shared_general_starter.resolver.AuthBearerTokenResolver;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    private final AuthInterceptor authInterceptor;
    private final AuthBearerTokenResolver authBearerTokenResolver;
    private final CorsProperties corsProperties;

    @Autowired
    public WebConfig(
        AuthBearerTokenResolver authBearerTokenResolver,
        CorsProperties corsProperties,
        AuthInterceptor authInterceptor
    ){
        this.authBearerTokenResolver = authBearerTokenResolver;
        this.corsProperties = corsProperties;
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(
            authInterceptor
        );
    }
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(corsProperties.getAllowedOriginsArray());
    }
}
