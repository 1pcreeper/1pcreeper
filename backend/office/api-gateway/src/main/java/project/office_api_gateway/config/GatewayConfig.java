package project.office_api_gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import project.office_api_gateway.properties.OfficeAccountServiceSpecProperties;
import project.office_api_gateway.properties.OfficeAuthProviderSpecProperties;
import project.office_api_gateway.properties.ServletProperties;

@Configuration
@Slf4j
public class GatewayConfig {
    private OfficeAuthProviderSpecProperties officeAuthProviderSpecProperties;
    private OfficeAccountServiceSpecProperties officeAccountServiceSpecProperties;
    private ServletProperties servletProperties;
    
    @Autowired
    public GatewayConfig(
        OfficeAuthProviderSpecProperties officeAuthProviderSpecProperties,
        OfficeAccountServiceSpecProperties officeAccountServiceSpecProperties, 
        ServletProperties servletProperties
    ) {
        this.officeAuthProviderSpecProperties = officeAuthProviderSpecProperties;
        this.officeAccountServiceSpecProperties = officeAccountServiceSpecProperties;
        this.servletProperties = servletProperties;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("oauth", r -> r.path(servletProperties.getContextPath()+"/oauth/**")
                .filters(f -> f
                    .filter(logPath())
                    .rewritePath(servletProperties.getContextPath()+"/oauth/(?<segment>.*)", "/${segment}"))
                .uri("lb://" + officeAuthProviderSpecProperties.getHostName() + ":" + officeAuthProviderSpecProperties.getHttpPort()))
            .route("account", r -> r.path(servletProperties.getContextPath()+"/account/**")
                .filters(f -> f
                    .filter(logPath())  
                    .rewritePath(servletProperties.getContextPath()+"/account/(?<segment>.*)", "/${segment}")) 
                .uri("lb://" + officeAccountServiceSpecProperties.getHostName() + ":" + officeAccountServiceSpecProperties.getHttpPort()))
            .build();
    }

    // Custom resolver to log the request path
    private GatewayFilter logPath() {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            log.debug(path);
            return chain.filter(exchange); 
        };
    }
}