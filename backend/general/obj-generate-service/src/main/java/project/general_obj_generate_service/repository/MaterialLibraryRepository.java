package project.general_obj_generate_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.general_obj_generate_service.model.entity.MaterialLibrary;
import project.general_obj_generate_service.model.entity.enums.MaterialCategory;
import project.general_obj_generate_service.repository.base.AbstractBaseRepository;

import java.util.List;

@Repository
public interface MaterialLibraryRepository extends AbstractBaseRepository<MaterialLibrary, Integer> {

    // Fetch all materials within a specific category
    List<MaterialLibrary> findByCategoryAndIsActiveTrue(MaterialCategory category);

    // Search materials by name (case-insensitive) - perfect for a search bar
    List<MaterialLibrary> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    @Query("SELECT m FROM MaterialLibrary m WHERE " +
        "m.isActive = true AND " +
        "(:category IS NULL OR m.category = :category) AND " +
        "(:name IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<MaterialLibrary> searchMaterials(@Param("category") MaterialCategory category,
                                          @Param("name") String name,
                                          Pageable pageable);
    
    boolean existsByName(String name);
}