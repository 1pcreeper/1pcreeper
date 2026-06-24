package project.office_api_gateway.factory;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class CrossSiteCookieFilterFactory extends AbstractGatewayFilterFactory<Object> {
    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) -> chain.filter(exchange).then(Mono.fromRunnable(() -> {
            exchange.getResponse().getHeaders().getOrEmpty(HttpHeaders.SET_COOKIE).forEach(cookieHeader -> {
                String updatedCookie = cookieHeader.concat("; Partitioned; Secure; HttpOnly;");
                exchange.getResponse().getHeaders().set(HttpHeaders.SET_COOKIE, updatedCookie);
            });
        }));
    }
}
