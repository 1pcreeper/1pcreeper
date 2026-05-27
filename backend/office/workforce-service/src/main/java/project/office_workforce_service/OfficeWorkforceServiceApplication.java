package project.office_workforce_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@EnableDiscoveryClient
@SpringBootApplication
@ComponentScan(basePackages = {
    "project.office_workforce_service",
    "project.shared_office_starter",
    "project.shared_office_common_lib"
})
public class OfficeWorkforceServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OfficeWorkforceServiceApplication.class, args);
	}

}
