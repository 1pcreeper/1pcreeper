package project.shared_office_starter.converter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.AbstractOAuth2Token;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import project.shared_office_common_lib.constant.JwtClaimKeysConstant;
import project.shared_office_starter.handler.base.JwtAuthRequestBaseHandler;
import project.shared_office_starter.service.base.UserDetailsBaseService;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Cacheable
public class JwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private final UserDetailsBaseService userDetailsBaseService;
    private final JwtAuthRequestBaseHandler jwtAuthRequestBaseHandler;
    @Autowired
    public JwtAuthenticationConverter(
        UserDetailsBaseService userDetailsBaseService,
        JwtAuthRequestBaseHandler jwtAuthRequestBaseHandler
    ) {
        this.userDetailsBaseService = userDetailsBaseService;
        this.jwtAuthRequestBaseHandler = jwtAuthRequestBaseHandler;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt source) {

        List<GrantedAuthority> combinedAuthorities = new ArrayList<>();
        
        jwtAuthRequestBaseHandler.handle(source);
        combinedAuthorities.addAll(extractAuthorities(source));

        String uid = source.getSubject();
        UserDetails userDetails = userDetailsBaseService.loadUserByUsername(uid);

        if (userDetails.getAuthorities() != null) {
            combinedAuthorities.addAll(userDetails.getAuthorities());
        }

        return new UsernamePasswordAuthenticationToken(userDetails, source, combinedAuthorities);
    };

    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        Object roles = jwt.getClaims().get(JwtClaimKeysConstant.ROLE_KEY);
        if (roles instanceof Collection<?>) {
            return ((Collection<?>) roles).stream()
                .map(role -> new SimpleGrantedAuthority(role.toString()))
                .collect(Collectors.toList());
        }
        return List.of();
    }
}
