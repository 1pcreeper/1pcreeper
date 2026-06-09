package project.general_api_gateway.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "properties.spec.general-obj-generate-service")
public class GeneralObjGenerateServiceSpecProperties {
    private String hostName;
    private String httpPort;
    private String grpcPort;
}
