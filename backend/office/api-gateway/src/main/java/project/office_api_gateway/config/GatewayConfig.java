package project.office_api_gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.factory.DedupeResponseHeaderGatewayFilterFactory;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import project.office_api_gateway.factory.CrossSiteCookieFilterFactory;
import project.office_api_gateway.properties.OfficeAccountServiceSpecProperties;
import project.office_api_gateway.properties.OfficeExpenditureServiceSpecProperties;
import project.office_api_gateway.properties.OfficeWorkforceServiceSpecProperties;
import project.office_api_gateway.properties.ServletProperties;

@Configuration
@Slf4j
public class GatewayConfig {
    private final OfficeAccountServiceSpecProperties officeAccountServiceSpecProperties;
    private final OfficeWorkforceServiceSpecProperties officeWorkforceServiceSpecProperties;
    private final OfficeExpenditureServiceSpecProperties officeExpenditureServiceSpecProperties;
    private final ServletProperties servletProperties;
    private final CrossSiteCookieFilterFactory crossSiteCookieFilterFactory;

    @Autowired
    public GatewayConfig(
        OfficeAccountServiceSpecProperties officeAccountServiceSpecProperties,
        OfficeWorkforceServiceSpecProperties officeWorkforceServiceSpecProperties,
        OfficeExpenditureServiceSpecProperties officeExpenditureServiceSpecProperties,
        ServletProperties servletProperties,
        CrossSiteCookieFilterFactory crossSiteCookieFilterFactory
    ) {
        this.officeAccountServiceSpecProperties = officeAccountServiceSpecProperties;
        this.officeWorkforceServiceSpecProperties = officeWorkforceServiceSpecProperties;
        this.officeExpenditureServiceSpecProperties = officeExpenditureServiceSpecProperties;
        this.servletProperties = servletProperties;
        this.crossSiteCookieFilterFactory = crossSiteCookieFilterFactory;
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
                    .dedupeResponseHeader(
                        "Access-Control-Allow-Origin Access-Control-Allow-Credentials",
                        DedupeResponseHeaderGatewayFilterFactory.Strategy.RETAIN_FIRST.name()
                    )
                    .rewriteResponseHeader("Set-Cookie", "(?<value>.*)", "${value}")
                    .filter(crossSiteCookieFilterFactory.apply(new Object()))
                )
                .uri("lb://" + officeAccountServiceSpecProperties.getHostName() + ":" + officeAccountServiceSpecProperties.getHttpPort()))
            .route("workforce", r -> r.path(servletProperties.getContextPath() + "/workforce/**")
                .and()
                .predicate(exchange -> !exchange.getRequest().getURI().getPath().contains("/internal/"))
                .filters(f -> f
                    .filter(logPath())
                    .rewritePath(servletProperties.getContextPath() + "/workforce/(?<segment>.*)", "/${segment}")
                    .dedupeResponseHeader(
                        "Access-Control-Allow-Origin Access-Control-Allow-Credentials",
                        DedupeResponseHeaderGatewayFilterFactory.Strategy.RETAIN_FIRST.name()
                    )
                )
                .uri("lb://" + officeWorkforceServiceSpecProperties.getHostName() + ":" + officeWorkforceServiceSpecProperties.getHttpPort()))
            .route("expenditure", r -> r.path(servletProperties.getContextPath() + "/expenditure/**")
                .and()
                .predicate(exchange -> !exchange.getRequest().getURI().getPath().contains("/internal/"))
                .filters(f -> f
                    .filter(logPath())
                    .rewritePath(servletProperties.getContextPath() + "/expenditure/(?<segment>.*)", "/${segment}")
                    .dedupeResponseHeader(
                        "Access-Control-Allow-Origin Access-Control-Allow-Credentials",
                        DedupeResponseHeaderGatewayFilterFactory.Strategy.RETAIN_FIRST.name()
                    ))
                .uri("lb://" + officeExpenditureServiceSpecProperties.getHostName() + ":" + officeExpenditureServiceSpecProperties.getHttpPort()))
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