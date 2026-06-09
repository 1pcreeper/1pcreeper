package project.general_obj_generate_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@EnableDiscoveryClient
@SpringBootApplication
@ComponentScan(basePackages = {
    "project.general_obj_generate_service",
    "project.shared_general_starter",
    "project.shared_general_common_lib"
})
public class GeneralObjGenerateServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GeneralObjGenerateServiceApplication.class, args);
    }
}
