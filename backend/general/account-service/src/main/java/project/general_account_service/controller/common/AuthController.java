package project.general_account_service.controller.common;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping(path = "/auth")
public class AuthController {
    @GetMapping("/hello")
    public String echoHello(){
        return "Hello";
    }
}
