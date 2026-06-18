package project.office_expenditure_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_expenditure_service.model.entity.User;
import project.office_expenditure_service.repository.base.AbstractBaseRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends AbstractBaseRepository<User,Long> {
    @Query("SELECT u FROM User u WHERE u.uid = :uid")
    Optional<User> findByUid(@Param("uid")String uid);
}
