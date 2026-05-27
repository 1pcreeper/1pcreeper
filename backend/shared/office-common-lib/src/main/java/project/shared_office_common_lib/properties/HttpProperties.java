package project.shared_office_common_lib.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "properties.http")
public class HttpProperties {
    private String isSecured;
    public boolean getSecured() {
        return isSecured.equalsIgnoreCase("true");
    }
}
