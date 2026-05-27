package project.office_account_service.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "properties.jwt")
public class JwtSecretProperties {
    private String secret;
}
