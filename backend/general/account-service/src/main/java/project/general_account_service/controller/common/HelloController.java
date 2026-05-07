package project.general_account_service.controller.common;

import jakarta.annotation.security.PermitAll;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.shared_general_starter.annotation.PermitByPass;

@RestController
@RequestMapping(path = "/hello")
public class HelloController {
    @GetMapping()
    @PermitByPass
    @PermitAll
    public String echoHello(){
        return "Hello";
    }
}
