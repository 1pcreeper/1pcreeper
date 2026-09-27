package project.office_transport_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@EnableDiscoveryClient
@SpringBootApplication
@ComponentScan(basePackages = {
    "project.office_transport_service",
    "project.shared_office_starter",
    "project.shared_office_common_lib"
})
public class OfficeTransportServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OfficeTransportServiceApplication.class, args);
	}

}
