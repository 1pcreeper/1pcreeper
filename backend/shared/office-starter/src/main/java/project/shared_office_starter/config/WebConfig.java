package project.shared_office_starter.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import project.shared_office_common_lib.properties.CorsProperties;
import project.shared_office_starter.interceptor.AbstractAuthBaseInterceptor;
import project.shared_office_starter.resolver.AuthBearerTokenResolver;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    private final AbstractAuthBaseInterceptor abstractAuthBaseInterceptor;
    private final AuthBearerTokenResolver authBearerTokenResolver;
    private final CorsProperties corsProperties;

    @Autowired
    public WebConfig(
        AuthBearerTokenResolver authBearerTokenResolver,
        CorsProperties corsProperties,
        AbstractAuthBaseInterceptor abstractAuthBaseInterceptor
    ) {
        this.authBearerTokenResolver = authBearerTokenResolver;
        this.corsProperties = corsProperties;
        this.abstractAuthBaseInterceptor = abstractAuthBaseInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(
            abstractAuthBaseInterceptor
        );
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(corsProperties.getAllowedOriginsArray())
            .allowCredentials(true)
            .allowedHeaders("*")
            .allowedMethods("*");
    }
}
