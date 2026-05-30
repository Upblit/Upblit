package com.upblit.backend.core.user;

import com.upblit.backend.Library.SupabaseService;
import com.upblit.backend.core.User;
import com.upblit.backend.core.org.LogoImageProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("User")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private SupabaseService supabaseService;
    @Autowired
    private LogoImageProcessor logoImageProcessor;

    @PostMapping
    public User create(@RequestBody User user){
        return userService.CreateUser(user);
    }

    @PutMapping
    public ResponseEntity<?> update(@ModelAttribute UserDTO userDTO,
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
                return ResponseEntity.ok(userService.updateCurrentUser(userDTO, logoUrl));
            }
            catch (IllegalArgumentException exception) {
                return ResponseEntity.badRequest().body(exception.getMessage());
            } catch (Exception exception) {
                return ResponseEntity.internalServerError().body("Failed to update organization");
            }
    }

    @GetMapping
    public User findAll(@RequestParam("username") String username){
        return userService.findUserByUsername(username);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteCurrentUser() {
        try {
            return ResponseEntity.ok(userService.deleteCurrentUser());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to delete user");
        }
    }
}
