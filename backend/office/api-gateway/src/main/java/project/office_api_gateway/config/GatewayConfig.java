package project.office_api_gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import project.office_api_gateway.properties.OfficeAccountServiceSpecProperties;
import project.office_api_gateway.properties.OfficeWorkforceServiceSpecProperties;
import project.office_api_gateway.properties.ServletProperties;

@Configuration
@Slf4j
public class GatewayConfig {
    private final OfficeAccountServiceSpecProperties officeAccountServiceSpecProperties;
    private final OfficeWorkforceServiceSpecProperties officeWorkforceServiceSpecProperties;
    private final ServletProperties servletProperties;
    
    @Autowired
    public GatewayConfig(
        OfficeAccountServiceSpecProperties officeAccountServiceSpecProperties, 
        OfficeWorkforceServiceSpecProperties officeWorkforceServiceSpecProperties,
        ServletProperties servletProperties
    ) {
        this.officeAccountServiceSpecProperties = officeAccountServiceSpecProperties;
        this.officeWorkforceServiceSpecProperties = officeWorkforceServiceSpecProperties;
        this.servletProperties = servletProperties;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("account", r -> r.path(servletProperties.getContextPath()+"/account/**")
                .filters(f -> f
                    .filter(logPath())  
                    .rewritePath(servletProperties.getContextPath()+"/account/(?<segment>.*)", "/${segment}")) 
                .uri("lb://" + officeAccountServiceSpecProperties.getHostName() + ":" + officeAccountServiceSpecProperties.getHttpPort()))
            .route("workforce", r -> r.path(servletProperties.getContextPath()+"/workforce/**")
                .filters(f -> f
                    .filter(logPath())
                    .rewritePath(servletProperties.getContextPath()+"/workforce/(?<segment>.*)", "/${segment}"))
                .uri("lb://" + officeWorkforceServiceSpecProperties.getHostName() + ":" + officeWorkforceServiceSpecProperties.getHttpPort()))
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