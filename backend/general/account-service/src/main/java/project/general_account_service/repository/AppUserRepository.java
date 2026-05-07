package project.general_account_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.general_account_service.model.entity.AppUser;
import project.general_account_service.repository.base.AbstractBaseRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppUserRepository extends AbstractBaseRepository<AppUser,Long> {
    @Query("SELECT u FROM AppUser u WHERE u.uid = :uid")
    Optional<AppUser> findByUid(@Param("uid")String uid);
    @Query("SELECT u FROM AppUser u WHERE u.name = :name")
    Optional<AppUser> findByName(@Param("name")String name);
    @Query("SELECT u FROM AppUser u WHERE u.name LIKE %:partialName%")
    Page<AppUser> findByNameContaining(@Param("partialName") String partialName, Pageable pageable);
    @Query("SELECT u FROM AppUser u WHERE u.name LIKE %:partialName%")
    List<AppUser> findByNameContaining(@Param("partialName") String partialName);
    boolean existsByName(String name);
}
