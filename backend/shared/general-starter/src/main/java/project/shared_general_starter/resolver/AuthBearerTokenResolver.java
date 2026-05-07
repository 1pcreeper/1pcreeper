package project.shared_general_starter.resolver;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import project.shared_general_common_lib.constant.AppUserRole;
import project.shared_general_common_lib.constant.CookieKeyConstant;
import project.shared_general_common_lib.constant.FirebaseClaimKeysConstant;
import project.shared_general_starter.annotation.PermitByPass;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import project.shared_general_starter.service.base.UserDetailsBaseService;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class AuthBearerTokenResolver implements BearerTokenResolver {

    @Override
    public String resolve(HttpServletRequest request){
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
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
