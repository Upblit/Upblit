package com.upblit.backend.core.ApiKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/apikey")
public class ApiKeyController {
    @Autowired
    private ApiKeyGenerator apiKeyGenerator;
    @PostMapping
    public ResponseEntity<?> ApiKey(@RequestParam Long ApplicationId) {
        String apiKey = apiKeyGenerator.generateApiKey(ApplicationId);
        if (apiKey == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(apiKey);
    }
}
