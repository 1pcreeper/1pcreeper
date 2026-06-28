package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.Person;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.repository.PersonRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.PropertyValidationException;

@Service
public class PersonManagerService extends AbstractBaseService<Person, Long> {

    private final PersonRepository personRepository;

    @Autowired
    public PersonManagerService(PersonRepository personRepository) {
        super(personRepository, "Person");
        this.personRepository = personRepository;
    }

    public Page<Person> search(String q, Boolean isActive, Pageable pageable) {
        return personRepository.search(q, isActive, pageable);
    }

    @Override
    public Person save(Person person) {
        if (person.getEmail() != null && !person.getEmail().contains("@")) {
            throw new PropertyValidationException("Invalid email format for Person.");
        }
        return super.save(person);
    }
    
    public Page<Person> findAllByIsActive(Boolean isActive, Pageable pageable){
        return personRepository.findAllByIsActive(isActive,pageable);
    }
    
}