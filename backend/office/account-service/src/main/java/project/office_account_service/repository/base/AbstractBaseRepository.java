package project.office_account_service.repository.base;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface AbstractBaseRepository<T, ID> extends JpaRepository<T, ID> {
    // Common repository methods can be defined here, if needed.
}
