package project.office_workforce_service.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.User;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.util.Optional;

@Repository
public interface UserRepository extends AbstractBaseRepository<User,Long> {
    @Query("SELECT u FROM User u WHERE u.uid = :uid")
    Optional<User> findByUid(@Param("uid")String uid);
}
