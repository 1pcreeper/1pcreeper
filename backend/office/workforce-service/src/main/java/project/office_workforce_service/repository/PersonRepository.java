package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.Person;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

@Repository
public interface PersonRepository extends AbstractBaseRepository<Person, Long> {

    @Query("SELECT p FROM Person p WHERE " +
        "(:q IS NULL OR " +
        "LOWER(p.nameEnglish) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(p.nameChinese) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(p.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "p.mobileTel LIKE CONCAT('%', :q, '%') OR " +
        "LOWER(p.hkId) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(p.cnId) LIKE LOWER(CONCAT('%', :q, '%'))) " +
        "AND (:isActive IS NULL OR p.isActive = :isActive)")
    Page<Person> search(@Param("q") String q,
                        @Param("isActive") Boolean isActive,
                        Pageable pageable);
}