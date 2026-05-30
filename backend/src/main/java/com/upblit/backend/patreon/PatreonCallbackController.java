package com.upblit.backend.patreon;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;

@RestController
@RequestMapping("/auth/patreon")
public class PatreonCallbackController {
    private final PatreonMembershipSyncService patreonMembershipSyncService;

    @Value("${frontend.uri}")
    private String frontendUrl;

    public PatreonCallbackController(PatreonMembershipSyncService patreonMembershipSyncService) {
        this.patreonMembershipSyncService = patreonMembershipSyncService;
    }

    @GetMapping("/callback")
    public ResponseEntity<?> callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error,
            @RequestParam(required = false) String error_description
    ) throws IOException, InterruptedException {
        if (error != null && !error.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, error_description == null || error_description.isBlank() ? error : error_description));
        }

        patreonMembershipSyncService.exchangeAuthorizationCode(code);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(frontendUrl + "/pricing?patreon=connected"))
                .build();
    }
}