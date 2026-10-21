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
import project.shared_office_starter.grpc.OfficeExpenditureRPCServiceGrpc;
import project.shared_office_starter.grpc.OfficeTransportRPCServiceGrpc;
import project.shared_office_starter.grpc.OfficeWorkforceRPCServiceGrpc;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Configuration
public class GrpcStubConfig {

    @Autowired
    private EurekaClient eurekaClient;

    // Account Service Port
    @Value("${grpc.client.office-account-service.port:9095}")
    private int officeAccountServicePort;

    // Workforce Service Port
    @Value("${grpc.client.office-workforce-service.port:9096}")
    private int officeWorkforceServicePort;

    // Transport Service Port
    @Value("${grpc.client.office-transport-service.port:9098}")
    private int officeTransportServicePort;

    // Expenditure Service Port
    @Value("${grpc.client.office-expenditure-service.port:9097}")
    private int officeExpenditureServicePort;

    // =========================================================================
    // Account Service Channel & Stubs
    // =========================================================================
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

    @Bean
    public OfficeAccountRPCServiceGrpc.OfficeAccountRPCServiceBlockingStub officeAccountRPCServiceBlockingStub() {
        return OfficeAccountRPCServiceGrpc.newBlockingStub(officeAccountServiceManagedChannel());
    }

    @Bean
    public OfficeAccountRPCServiceGrpc.OfficeAccountRPCServiceBlockingStub generalAccountRPCServiceBlockingStub() {
        return officeAccountRPCServiceBlockingStub();
    }

    // =========================================================================
    // Workforce Service Channel & Stubs
    // =========================================================================
    @Bean
    public ManagedChannel officeWorkforceServiceManagedChannel() {
        String officeWorkforceServiceAddress;
        try {
            InstanceInfo instanceInfo = eurekaClient.getNextServerFromEureka(
                ServiceRegistryIDNames.OFFICE_WORKFORCE_SERVICE, false
            );
            officeWorkforceServiceAddress = instanceInfo.getIPAddr();
        } catch (Exception e) {
            officeWorkforceServiceAddress = ServiceRegistryIDNames.OFFICE_WORKFORCE_SERVICE;
        }
        return ManagedChannelBuilder.forAddress(officeWorkforceServiceAddress, officeWorkforceServicePort)
            .usePlaintext()
            .enableRetry()
            .defaultServiceConfig(buildServiceConfig())
            .build();
    }

    @Bean
    public OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceBlockingStub officeWorkforceRPCServiceBlockingStub() {
        return OfficeWorkforceRPCServiceGrpc.newBlockingStub(officeWorkforceServiceManagedChannel());
    }

    // =========================================================================
    // Transport Service Channel & Stubs
    // =========================================================================
    @Bean
    public ManagedChannel officeTransportServiceManagedChannel() {
        String officeTransportServiceAddress;
        try {
            InstanceInfo instanceInfo = eurekaClient.getNextServerFromEureka(
                ServiceRegistryIDNames.OFFICE_TRANSPORT_SERVICE, false
            );
            officeTransportServiceAddress = instanceInfo.getIPAddr();
        } catch (Exception e) {
            officeTransportServiceAddress = ServiceRegistryIDNames.OFFICE_TRANSPORT_SERVICE;
        }
        return ManagedChannelBuilder.forAddress(officeTransportServiceAddress, officeTransportServicePort)
            .usePlaintext()
            .enableRetry()
            .defaultServiceConfig(buildServiceConfig())
            .build();
    }

    @Bean
    public OfficeTransportRPCServiceGrpc.OfficeTransportRPCServiceBlockingStub officeTransportRPCServiceBlockingStub() {
        return OfficeTransportRPCServiceGrpc.newBlockingStub(officeTransportServiceManagedChannel());
    }

    // =========================================================================
    // Expenditure Service Channel & Stubs
    // =========================================================================
    @Bean
    public ManagedChannel officeExpenditureServiceManagedChannel() {
        String officeExpenditureServiceAddress;
        try {
            InstanceInfo instanceInfo = eurekaClient.getNextServerFromEureka(
                ServiceRegistryIDNames.OFFICE_EXPENDITURE_SERVICE, false
            );
            officeExpenditureServiceAddress = instanceInfo.getIPAddr();
        } catch (Exception e) {
            officeExpenditureServiceAddress = ServiceRegistryIDNames.OFFICE_EXPENDITURE_SERVICE;
        }
        return ManagedChannelBuilder.forAddress(officeExpenditureServiceAddress, officeExpenditureServicePort)
            .usePlaintext()
            .enableRetry()
            .defaultServiceConfig(buildServiceConfig())
            .build();
    }

    @Bean
    public OfficeExpenditureRPCServiceGrpc.OfficeExpenditureRPCServiceBlockingStub officeExpenditureRPCServiceBlockingStub() {
        return OfficeExpenditureRPCServiceGrpc.newBlockingStub(officeExpenditureServiceManagedChannel());
    }

    // =========================================================================
    // Resilient Retry & Load Balancing Policy
    // =========================================================================
    private Map<String, Object> buildServiceConfig() {
        return Map.of(
            "loadBalancingConfig",
            List.of(
                Map.of("weighted_round_robin", Map.of()),
                Map.of("round_robin", Map.of()),
                Map.of("pick_first", Map.of("shuffleAddressList", true))
            ),
            "methodConfig",
            List.of(
                Map.of(
                    "name", List.of(Map.of("service", "")),
                    "waitForReady", true,
                    "retryPolicy",
                    Map.of(
                        "maxAttempts", (double) 5,
                        "initialBackoff", durationToServiceConfigString(Duration.ofMillis(500)),
                        "backoffMultiplier", "2.0",
                        "maxBackoff", durationToServiceConfigString(Duration.ofSeconds(2)),
                        "retryableStatusCodes", List.of("UNAVAILABLE")
                    )
                )
            )
        );
    }

    @NotNull
    private String durationToServiceConfigString(@NotNull Duration duration) {
        return (duration.toMillis() / 1000.0) + "s";
    }
}