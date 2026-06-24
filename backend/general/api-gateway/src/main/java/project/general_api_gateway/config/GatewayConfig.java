package project.general_api_gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import project.general_api_gateway.properties.GeneralAccountServiceSpecProperties;
import project.general_api_gateway.properties.GeneralObjGenerateServiceSpecProperties;
import project.general_api_gateway.properties.ServletProperties;

@Configuration
@Slf4j
public class GatewayConfig {

    private GeneralAccountServiceSpecProperties generalAccountServiceSpecProperties;
    private GeneralObjGenerateServiceSpecProperties generalObjGenerateServiceSpecProperties;
    private ServletProperties servletProperties;

    @Autowired
    public GatewayConfig(
        GeneralAccountServiceSpecProperties generalAccountServiceSpecProperties,
        GeneralObjGenerateServiceSpecProperties generalObjGenerateServiceSpecProperties,
        ServletProperties servletProperties) {
        this.generalAccountServiceSpecProperties = generalAccountServiceSpecProperties;
        this.generalObjGenerateServiceSpecProperties = generalObjGenerateServiceSpecProperties;
        this.servletProperties = servletProperties;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("account", r -> r.path(servletProperties.getContextPath() + "/account/**")
                .and()
                .predicate(exchange -> !exchange.getRequest().getURI().getPath().contains("/internal/"))
                .filters(f -> f
                    .filter(logPath())
                    .rewritePath(servletProperties.getContextPath() + "/account/(?<segment>.*)", "/${segment}")
                )
                .uri("lb://" + generalAccountServiceSpecProperties.getHostName() + ":" + generalAccountServiceSpecProperties.getHttpPort()))
            .route("obj-generate", r -> r.path(servletProperties.getContextPath() + "/obj-generate/**")
                .and()
                .predicate(exchange -> !exchange.getRequest().getURI().getPath().contains("/internal/"))
                .filters(f -> f
                    .filter(logPath())
                    .rewritePath(servletProperties.getContextPath() + "/obj-generate/(?<segment>.*)", "/${segment}"))
                .uri("lb://" + generalObjGenerateServiceSpecProperties.getHostName() + ":" + generalObjGenerateServiceSpecProperties.getHttpPort()))
            .build();
    }

    private GatewayFilter logPath() {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            log.debug(path);
            return chain.filter(exchange);
        };
    }
}