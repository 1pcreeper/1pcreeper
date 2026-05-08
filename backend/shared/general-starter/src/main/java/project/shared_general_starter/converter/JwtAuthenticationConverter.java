package project.shared_general_starter.converter;

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
import project.shared_general_common_lib.constant.FirebaseClaimKeysConstant;
import project.shared_general_starter.handler.base.JwtAuthRequestBaseHandler;
import project.shared_general_starter.service.base.UserDetailsBaseService;

import java.util.Collection;
import java.util.Collections;
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
        
        jwtAuthRequestBaseHandler.handle(source);
        Collection<GrantedAuthority> authorities = extractAuthorities(source);

        String uid = source.getSubject();
        UserDetails userDetails = userDetailsBaseService.loadUserByUsername(uid);

        return new UsernamePasswordAuthenticationToken(userDetails, source, authorities);
    };

    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        Object roles = jwt.getClaims().get(FirebaseClaimKeysConstant.ROLE_KEY);
        if (roles instanceof Collection<?>) {
            return ((Collection<?>) roles).stream()
                .map(role -> new SimpleGrantedAuthority(role.toString()))
                .collect(Collectors.toList());
        }
        return Collections.emptyList();
    }
}
