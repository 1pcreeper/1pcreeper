package project.office_api_gateway.factory;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import project.shared_office_common_lib.properties.HttpProperties;
import reactor.core.publisher.Mono;

@Component
public class CrossSiteCookieFilterFactory extends AbstractGatewayFilterFactory<Object> {
    private final HttpProperties httpProperties;
    public CrossSiteCookieFilterFactory(HttpProperties httpProperties){
        this.httpProperties = httpProperties;
    }
    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) -> chain.filter(exchange).then(Mono.fromRunnable(() -> {
            exchange.getResponse().getHeaders().getOrEmpty(HttpHeaders.SET_COOKIE).forEach(cookieHeader -> {
                exchange.getResponse().getHeaders().set(HttpHeaders.SET_COOKIE, cookieHeader);
            });
        }));
    }
}
