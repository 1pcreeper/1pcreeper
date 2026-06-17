package project.shared_general_starter.service.producer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import project.shared_general_common_lib.constant.KafkaTopicGroupsConstant;
import project.shared_general_common_lib.constant.StreamBridgeTopicsConstant;
import project.shared_general_starter.model.event.ProjectGenerationCreateEvent;

@Service
public class KafkaPolyroomProducerService {
    @Autowired
    private StreamBridge streamBridge;

    public boolean produceProjectGenerationCreateEvent(ProjectGenerationCreateEvent event) {
        Message<ProjectGenerationCreateEvent> message = MessageBuilder.withPayload(event)
            .setHeader(KafkaHeaders.PARTITION, 0)
            .setHeader(KafkaHeaders.GROUP_ID, KafkaTopicGroupsConstant.GENERAL_PUBLIC_GROUP)
            .build();
        return streamBridge.send(StreamBridgeTopicsConstant.GENERAL_KAFKA_POLYROOM_PROJECT_GENERATE_TOPIC_OUT_0, message);
    }
}
