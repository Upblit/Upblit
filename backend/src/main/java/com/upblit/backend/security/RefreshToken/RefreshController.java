package com.upblit.backend.security.RefreshToken;

import com.nimbusds.oauth2.sdk.token.RefreshToken;
import com.upblit.backend.core.User;
import com.upblit.backend.core.UserRepository;
import com.upblit.backend.security.JWT.JWTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/auth/refresh")
public class RefreshController {

    @Autowired
    private RefreshService refreshService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTService jwtService;

    @GetMapping
    public ResponseEntity<?> getRefreshToken(@RequestParam String refreshToken)
    {
        Refresh refresh = refreshService.findRefreshByRefreshToken(refreshToken);
        if(refresh == null || refresh.getExpiresAt().isBefore(Instant.now())) return ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED)).build();
        User user= userRepository.findById(refresh.getUserId()).orElse(null);
        if(user == null) return ResponseEntity.of(ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED)).build();
        String JWT= jwtService.generateToken(String.valueOf(user.getId()), user.getAvatarUrl(), user.getUsername(), user.getEmail(), user.getPlan());
        return ResponseEntity.ok(JWT);
    }
}
