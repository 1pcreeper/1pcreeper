package project.general_account_service.interceptor;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import project.general_account_service.service.account.AccountSyncService;
import project.shared_general_auth_starter.service.auth.FirebaseAuthService;
import project.shared_general_common_lib.constant.CookieKeyConstant;
import project.shared_general_starter.interceptor.AbstractAuthBaseInterceptor;

import java.util.Objects;

@Component
public class AuthInterceptor extends AbstractAuthBaseInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (handler instanceof HandlerMethod) {
//            HandlerMethod handlerMethod = (HandlerMethod) handler;
//            if (handlerMethod.hasMethodAnnotation(<CLASS>.class)) {
//                return true;
//            }
        }
        
        return true;
    }
}