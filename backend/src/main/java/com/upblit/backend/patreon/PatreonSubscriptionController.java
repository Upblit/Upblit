package com.upblit.backend.patreon;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/patreon")
public class PatreonSubscriptionController {
    @Value("${app.patreon.join-url:https://www.patreon.com/Upblit}")
    private String joinUrl;

    @GetMapping("/subscribe")
    public ResponseEntity<Void> subscribe() {
        return ResponseEntity.status(302).location(URI.create(joinUrl)).build();
    }
}