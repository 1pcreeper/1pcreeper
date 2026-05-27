package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.PersonDetail;
import project.office_workforce_service.model.entity.enums.Gender;
import project.office_workforce_service.repository.PersonDetailRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class PersonDetailManagerService extends AbstractBaseService<PersonDetail, Long> {

    private final PersonDetailRepository personDetailRepository;

    @Autowired
    public PersonDetailManagerService(PersonDetailRepository personDetailRepository) {
        super(personDetailRepository, "PersonDetail");
        this.personDetailRepository = personDetailRepository;
    }

    public PersonDetail findByPersonId(Long personId) {
        return personDetailRepository.findByPersonId(personId)
            .orElseThrow(() -> new ResourceNotFoundException("PersonDetail not found for person id: " + personId));
    }

    public Page<PersonDetail> search(String q, Gender gender, Pageable pageable) {
        return personDetailRepository.search(q, gender, pageable);
    }
}