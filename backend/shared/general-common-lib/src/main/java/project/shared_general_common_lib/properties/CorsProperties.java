package project.shared_general_common_lib.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "properties.cors")
public class CorsProperties {
    private String allowedOrigins;
    public String[] getAllowedOriginsArray() {
            return allowedOrigins.split(",");
    }
}
