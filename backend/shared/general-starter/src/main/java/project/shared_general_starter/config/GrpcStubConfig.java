package project.shared_general_starter.config;

import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.EurekaClient;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import project.shared_general_starter.grpc.GeneralAccountRPCServiceGrpc;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Configuration
public class GrpcStubConfig {
    @Value("${grpc.client.general-account-service.address}")
    private String generalAccountServiceAddress;
    @Value("${grpc.client.general-account-service.port}")
    private int generalAccountServicePort;
    @Autowired
    private EurekaClient eurekaClient;

    @Bean
    public ManagedChannel generalAccountServiceManagedChannel() {
        String host;
        try {
            InstanceInfo instanceInfo = eurekaClient.getNextServerFromEureka(generalAccountServiceAddress, false);
            host = instanceInfo.getIPAddr();
        } catch (Exception e) {
            host = generalAccountServiceAddress;
        }
        return ManagedChannelBuilder.forAddress(host, generalAccountServicePort)
            .usePlaintext()
            .enableRetry()
            .defaultServiceConfig(buildServiceConfig())
            .build();
    }

    //injection

    @Bean
    public GeneralAccountRPCServiceGrpc.GeneralAccountRPCServiceBlockingStub generalAccountRPCServiceBlockingStub() {
        return GeneralAccountRPCServiceGrpc.newBlockingStub(generalAccountServiceManagedChannel());
    }
//
//    @Bean
//    public RoleRPCServiceGrpc.RoleRPCServiceBlockingStub roleRPCServiceBlockingStub() {
//        return RoleRPCServiceGrpc.newBlockingStub(userAccountServiceManagedChannel());
//    }
//
//    @Bean
//    public BusinessRPCServiceGrpc.BusinessRPCServiceBlockingStub businessRPCServiceBlockingStub() {
//        return BusinessRPCServiceGrpc.newBlockingStub(userAccountServiceManagedChannel());
//    }
//
//    @Bean
//    public AccountVerifyManagerRPCServiceGrpc.AccountVerifyManagerRPCServiceBlockingStub accountVerifyManagerRPCServiceBlockingStub() {
//        return AccountVerifyManagerRPCServiceGrpc.newBlockingStub(userAccountServiceManagedChannel());
//    }
//    
//    @Bean
//    public BusinessContactRPCServiceGrpc.BusinessContactRPCServiceBlockingStub businessContactRPCServiceBlockingStub() {
//        return BusinessContactRPCServiceGrpc.newBlockingStub(userAccountServiceManagedChannel());
//    }
//    
//    @Bean
//    public UserContactRPCServiceGrpc.UserContactRPCServiceBlockingStub userContactRPCServiceBlockingStub() {
//        return UserContactRPCServiceGrpc.newBlockingStub(userAccountServiceManagedChannel());
//    }


    private Map<String, Object> buildServiceConfig() {

        return Map.of(
            "loadBalancingConfig",
            List.of(
                Map.of("weighted_round_robin", Map.of()),
                Map.of("round_robin", Map.of()),
                Map.of("pick_first", Map.of("shuffleAddressList", true))),
            "methodConfig",
            List.of(
                Map.of(
                    "name", List.of(Map.of("service", "")),
                    "waitForReady", true,
                    "retryPolicy",
                    Map.of(
                        "maxAttempts", (double) 5,
                        "initialBackoff", durationToServiceConfigString(Duration.ofSeconds(2)),
                        "backoffMultiplier", "2.0",
                        "maxBackoff", durationToServiceConfigString(Duration.ofSeconds(2)),
                        "retryableStatusCodes", List.of("UNAVAILABLE")))));
    }

    @NotNull
    private String durationToServiceConfigString(@NotNull Duration duration) {
        return (duration.toMillis() / 1000.0) + "s";
    }
}