package project.office_dummy_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@EnableDiscoveryClient
@SpringBootApplication
@ComponentScan(basePackages = {
    "project.office_dummy_service",
    "project.shared_office_starter",
    "project.shared_office_common_lib"
})
public class OfficeDummyServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OfficeDummyServiceApplication.class, args);
	}

}
