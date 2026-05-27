package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.PlaceScheduleRule;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.util.Optional;

@Repository
public interface PlaceScheduleRuleRepository extends AbstractBaseRepository<PlaceScheduleRule, Long> {

    Optional<PlaceScheduleRule> findByPlaceId(Long placeId);
}