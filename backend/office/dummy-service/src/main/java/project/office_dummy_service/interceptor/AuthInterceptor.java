package project.office_dummy_service.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import project.shared_office_starter.interceptor.AbstractAuthBaseInterceptor;

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