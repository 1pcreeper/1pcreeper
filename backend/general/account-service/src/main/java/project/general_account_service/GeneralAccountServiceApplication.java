package project.general_account_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableDiscoveryClient
@SpringBootApplication
@ComponentScan(basePackages = {
    "project.general_account_service",
    "project.shared_general_auth_starter",
    "project.shared_general_starter",
    "project.shared_general_common_lib"
})
public class GeneralAccountServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GeneralAccountServiceApplication.class, args);
    }
}
