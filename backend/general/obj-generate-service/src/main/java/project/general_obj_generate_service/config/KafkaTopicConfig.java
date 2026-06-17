package project.general_obj_generate_service.config;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {
    @Bean
    public NewTopic newPolyroomProjectGenerateTopic() {
        return TopicBuilder.name("general-kafka-polyroom-project-generate-topic")
            .partitions(3)
            .replicas(1)
            .build();
    }
    @Bean
    public NewTopic newHunyuanObjTextureMappingTopic () {
        return TopicBuilder.name("general-kafka-hunyuan-obj-texture-mapping-topic")
            .partitions(3)
            .replicas(1)
            .build();
    }
}
