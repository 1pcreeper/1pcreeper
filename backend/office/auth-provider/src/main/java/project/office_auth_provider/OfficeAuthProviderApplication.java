package project.office_auth_provider;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class OfficeAuthProviderApplication {

	public static void main(String[] args) {
		SpringApplication.run(OfficeAuthProviderApplication.class, args);
	}

}
