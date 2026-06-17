package project.general_obj_generate_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.general_obj_generate_service.model.entity.MaterialLibrary;
import project.general_obj_generate_service.model.entity.enums.MaterialCategory;
import project.general_obj_generate_service.repository.MaterialLibraryRepository;
import project.general_obj_generate_service.service.base.AbstractBaseService;

import java.util.List;

@Service
public class MaterialLibraryManagerService extends AbstractBaseService<MaterialLibrary, Integer> {

    private final MaterialLibraryRepository materialLibraryRepository;

    @Autowired
    public MaterialLibraryManagerService(MaterialLibraryRepository materialLibraryRepository) {
        super(materialLibraryRepository, "MaterialLibrary");
        this.materialLibraryRepository = materialLibraryRepository;
    }

    /**
     * Retrieve all active materials by a specific category.
     */
    public List<MaterialLibrary> getMaterialsByCategory(MaterialCategory category) {
        return materialLibraryRepository.findByCategoryAndIsActiveTrue(category);
    }

    /**
     * Simple search by name for quick suggestions or dropdowns.
     */
    public List<MaterialLibrary> searchMaterialsByName(String name) {
        return materialLibraryRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name);
    }

    /**
     * Advanced paginated search for the material library dashboard.
     */
    public Page<MaterialLibrary> searchMaterials(MaterialCategory category, String name, Pageable pageable) {
        return materialLibraryRepository.searchMaterials(category, name, pageable);
    }

    /**
     * Helper to verify name uniqueness before creating a new entry.
     */
    public boolean isMaterialNameAvailable(String name) {
        return !materialLibraryRepository.existsByName(name);
    }
}