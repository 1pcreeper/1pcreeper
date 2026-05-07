package project.general_api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

@EnableDiscoveryClient
@SpringBootApplication(excludeName = {
    "org.springframework.cloud.gateway.config.GatewayGrpcAutoConfiguration"
})
@ComponentScan(
    basePackages = {
        "project.general_api_gateway",
        "project.shared_general_auth_starter",
        "project.shared_general_common_lib"
    },
    // 關鍵：排除掉所有 Servlet 版的 Security 配置類別
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {
        }
    )
)
public class GeneralAPIGatewayApplication {
    public static void main(String[] args) {
        // 強制設定為反應式環境，防止 Tomcat 偷跑
        SpringApplication app = new SpringApplication(GeneralAPIGatewayApplication.class);
        app.setWebApplicationType(WebApplicationType.REACTIVE);
        app.run(args);
    }
}
