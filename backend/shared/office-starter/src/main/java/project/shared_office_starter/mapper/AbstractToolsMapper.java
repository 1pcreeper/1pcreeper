package project.shared_office_starter.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public abstract class AbstractToolsMapper {
    protected final ObjectMapper objectMapper;
    public AbstractToolsMapper() {
        this.objectMapper = new ObjectMapper();
    }
}
