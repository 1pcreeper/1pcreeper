package project.general_account_service.model.entity.base;

import jakarta.persistence.*;
import lombok.Getter;

import java.io.Serializable;

@Getter
@MappedSuperclass
public abstract class AbstractPersistableEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        AbstractPersistableEntity that = (AbstractPersistableEntity) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : super.hashCode();
    }
}
