package project.general_dummy_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@EnableDiscoveryClient
@SpringBootApplication
@ComponentScan(basePackages = {
    "project.general_dummy_service",
    "project.shared_general_starter",
    "project.shared_general_common_lib"
})
public class GeneralDummyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GeneralDummyServiceApplication.class, args);
    }
}
