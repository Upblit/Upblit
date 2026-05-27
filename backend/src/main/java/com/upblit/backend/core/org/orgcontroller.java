package com.upblit.backend.core.org;

import com.upblit.backend.Library.SupabaseService;
import com.upblit.backend.core.Organization;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/org")
public class orgcontroller {
    @Autowired
    private SupabaseService supabaseService;

    @Autowired
    private LogoImageProcessor logoImageProcessor;

    @Autowired
    private OrganizationService organizationService;

    @PostMapping
    public ResponseEntity<?> create(@ModelAttribute OrganizationDTO orgDTO,
                                    @RequestParam("file") MultipartFile file) {
        try {
            LogoImageProcessor.ProcessedLogo processedLogo = logoImageProcessor.validateAndCropToSquare(file);
            String LogoUrl = supabaseService.uploadFile(
                processedLogo.content(),
                processedLogo.filename(),
                processedLogo.contentType(),
                "Avatars"
            );
            return ResponseEntity.ok(organizationService.create(orgDTO,LogoUrl));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        } catch (Exception exception) {
            return ResponseEntity.internalServerError().body("Failed to create organization");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @ModelAttribute OrganizationDTO orgDTO,
                                    @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            String logoUrl = null;
            if (file != null && !file.isEmpty()) {
                LogoImageProcessor.ProcessedLogo processedLogo = logoImageProcessor.validateAndCropToSquare(file);
                logoUrl = supabaseService.uploadFile(
                    processedLogo.content(),
                    processedLogo.filename(),
                    processedLogo.contentType(),
                    "Avatars"
                );
            }

            return organizationService.update(id, orgDTO, logoUrl);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        } catch (Exception exception) {
            return ResponseEntity.internalServerError().body("Failed to update organization");
        }
    }
    @GetMapping
     public ResponseEntity<?> get(){
        return ResponseEntity.ok().body(organizationService.findAll());

     }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return organizationService.delete(id);
    }
}
