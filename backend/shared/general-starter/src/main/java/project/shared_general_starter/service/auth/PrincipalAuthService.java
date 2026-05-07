package project.shared_general_starter.service.auth;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import project.shared_general_common_lib.constant.FirebaseClaimKeysConstant;
import project.shared_general_starter.model.exception.PrincipalException;

import java.security.Principal;
import java.util.*;

@Service
public class PrincipalAuthService {
    public Map<String,Object> getPrincipalData(Principal principal) throws PrincipalException {
        Map<String, Object> data = new HashMap<>();
        String roleKey = FirebaseClaimKeysConstant.ROLE_KEY;
        data.put(roleKey, getRolesAsStringList(principal));

        return data;
    }
    public List<String> getRolesAsStringList(Principal principal) throws PrincipalException{
        return getRolesClaim(principal);
    }
    public boolean hasRoles(Principal principal,List<String> roleIds) throws PrincipalException{
        Set<String> staffRoles = new HashSet<>(getRolesClaim(principal));
        Set<String> requiredRoles = new HashSet<>(roleIds);
        return staffRoles.containsAll(requiredRoles);
    }

    private Object getClaim(Principal principal, String claim) throws PrincipalException {
        try {
            JwtAuthenticationToken token = (JwtAuthenticationToken) principal;
            return token.getTokenAttributes().get(claim);
        } catch (Exception e) {
            throw new PrincipalException("Cannot read the principle");
        }
    }

    private List<String> getRolesClaim(Principal principal) throws PrincipalException {
        return (List<String>) getClaim(principal, FirebaseClaimKeysConstant.ROLE_KEY);
    }
}
