package project.office_account_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_account_service.model.entity.OfficeUser;
import project.office_account_service.repository.base.AbstractBaseRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficeUserRepository extends AbstractBaseRepository<OfficeUser,Long> {
    @Query("SELECT u FROM OfficeUser u WHERE u.uid = :uid")
    Optional<OfficeUser> findByUid(@Param("uid")String uid);
    @Query("SELECT u FROM OfficeUser u WHERE u.name = :name")
    Optional<OfficeUser> findByName(@Param("name")String name);
    @Query("SELECT u FROM OfficeUser u WHERE u.email = :email")
    Optional<OfficeUser> findByEmail(@Param("email")String email);
    @Query("SELECT u FROM OfficeUser u WHERE u.name LIKE %:partialName%")
    Page<OfficeUser> findByNameContaining(@Param("partialName") String partialName, Pageable pageable);
    @Query("SELECT u FROM OfficeUser u WHERE u.name LIKE %:partialName%")
    List<OfficeUser> findByNameContaining(@Param("partialName") String partialName);
}
