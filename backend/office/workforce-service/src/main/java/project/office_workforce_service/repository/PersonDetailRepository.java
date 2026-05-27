package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.PersonDetail;
import project.office_workforce_service.model.entity.enums.Gender;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.util.Optional;

@Repository
public interface PersonDetailRepository extends AbstractBaseRepository<PersonDetail, Long> {

    Optional<PersonDetail> findByPersonId(Long personId);

    @Query("SELECT pd FROM PersonDetail pd WHERE " +
        "(:q IS NULL OR " +
        "LOWER(pd.nationality) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(pd.occupation) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(pd.address) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
        "(:gender IS NULL OR pd.gender = :gender)")
    Page<PersonDetail> search(@Param("q") String q,
                              @Param("gender") Gender gender,
                              Pageable pageable);
}