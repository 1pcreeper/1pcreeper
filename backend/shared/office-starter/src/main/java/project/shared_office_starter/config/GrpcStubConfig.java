package project.shared_office_starter.config;

import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.EurekaClient;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import project.shared_office_common_lib.constant.ServiceRegistryIDNames;
import project.shared_office_starter.grpc.OfficeAccountRPCServiceGrpc;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Configuration
public class GrpcStubConfig {
    @Autowired
    private EurekaClient eurekaClient;
    @Value("${grpc.client.office-account-service.port}")
    private int officeAccountServicePort;

    @Bean
    public ManagedChannel officeAccountServiceManagedChannel() {
        String officeAccountServiceAddress;
        try {
            InstanceInfo instanceInfo = eurekaClient.getNextServerFromEureka(
                ServiceRegistryIDNames.OFFICE_ACCOUNT_SERVICE, false
            );
            officeAccountServiceAddress = instanceInfo.getIPAddr();
        } catch (Exception e) {
            officeAccountServiceAddress = ServiceRegistryIDNames.OFFICE_ACCOUNT_SERVICE;
        }
        return ManagedChannelBuilder.forAddress(officeAccountServiceAddress, officeAccountServicePort)
            .usePlaintext()
            .enableRetry()
            .defaultServiceConfig(buildServiceConfig())
            .build();
    }

    //injection

    @Bean
    public OfficeAccountRPCServiceGrpc.OfficeAccountRPCServiceBlockingStub generalAccountRPCServiceBlockingStub() {
        return OfficeAccountRPCServiceGrpc.newBlockingStub(officeAccountServiceManagedChannel());
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