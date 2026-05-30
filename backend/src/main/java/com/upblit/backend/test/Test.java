package com.upblit.backend.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/")
public class Test {
    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    @PostMapping
    public String test2(@RequestBody String body){
        System.out.println(body);
        return body;
    }
    @GetMapping("/token")
    public ResponseEntity<String> getAccessToken(
            @RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient authorizedClient) {

        if (authorizedClient == null) {
            return ResponseEntity.status(401).body("Unauthorized or no client registered.");
        }

        return ResponseEntity.ok(authorizedClient.getAccessToken().getTokenValue());
    }

}

