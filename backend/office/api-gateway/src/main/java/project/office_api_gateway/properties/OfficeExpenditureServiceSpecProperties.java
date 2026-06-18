package project.office_api_gateway.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "properties.spec.office-expenditure-service")
public class OfficeExpenditureServiceSpecProperties {
    private String hostName;
    private String httpPort;
    private String grpcPort;
}
