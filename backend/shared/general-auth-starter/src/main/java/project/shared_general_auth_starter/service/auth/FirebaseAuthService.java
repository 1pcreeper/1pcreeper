package project.shared_general_auth_starter.service.auth;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.shared_general_common_lib.constant.AppUserRole;
import project.shared_general_common_lib.constant.CookieKeyConstant;
import project.shared_general_common_lib.constant.FirebaseClaimKeysConstant;
import project.shared_general_auth_starter.model.bo.request.FirebaseCreateUserRequestBO;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FirebaseAuthService {
    private final FirebaseAuth firebaseAuth;

    @Autowired
    public FirebaseAuthService(
        FirebaseAuth firebaseAuth
    ) {
        this.firebaseAuth = firebaseAuth;
    }

    public String createUser(FirebaseCreateUserRequestBO reqBo) throws FirebaseAuthException {
        UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
            .setUid(reqBo.getUid())
            .setDisplayName(reqBo.getDisplayName())
            .setEmail(reqBo.getEmail())
            .setPassword(reqBo.getPassword())
            .setDisabled(reqBo.isDisable())
            .setEmailVerified(reqBo.isEmailVerified());
        UserRecord userRecord = firebaseAuth.createUser(createRequest);
        return userRecord.getUid();
    }
    
    public void setRoles(String uid, List<String> roles) throws FirebaseAuthException{
        Map<String, Object> claims = Map.of(
            FirebaseClaimKeysConstant.ROLE_KEY, roles
        );
        firebaseAuth.revokeRefreshTokens(uid);
        firebaseAuth.setCustomUserClaims(uid, claims);
    }
    
    public Set<String> getRoles(String uid) throws FirebaseAuthException {
        UserRecord userRecord = getUser(uid);
        Object roleData = userRecord.getCustomClaims().get(CookieKeyConstant.SECURE);
        try{
            List<String> roleList = (List<String>) roleData;
            return new HashSet<>(roleList);
        } catch (RuntimeException e) {
            throw new RuntimeException("Roles Format Error");
        }
    }
    
    public UserRecord getUser(String uid) throws FirebaseAuthException{
        return firebaseAuth.getUser(uid);
    }
    
    public UserRecord getUserByEmail(String email) throws FirebaseAuthException{
        return firebaseAuth.getUserByEmail(email);
    }
    
    public FirebaseToken verifyIdToken(String idToken) throws FirebaseAuthException {
        return firebaseAuth.verifyIdToken(idToken);
    }
    
    public UserRecord updateUser(UserRecord.UpdateRequest updateRequest) throws FirebaseAuthException{
        return firebaseAuth.updateUser(updateRequest);
    }
}
