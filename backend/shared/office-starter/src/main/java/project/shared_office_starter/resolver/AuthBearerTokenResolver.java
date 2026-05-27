package project.shared_office_starter.resolver;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import project.shared_office_common_lib.constant.CookieKeyConstant;

import java.util.*;

@Component
public class AuthBearerTokenResolver implements BearerTokenResolver {

    @Override
    public String resolve(HttpServletRequest request){
        String header = request.getHeader("Authorization");
        if (header != null) {
            if(header.startsWith("Bearer ")){
                return header.substring(7);
            }else{
                return null;
            }
        }
        Cookie[] cookies = request.getCookies();
        if (Objects.nonNull(cookies)) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(CookieKeyConstant.SECURE)) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
