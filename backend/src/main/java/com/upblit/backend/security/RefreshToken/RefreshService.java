package com.upblit.backend.security.RefreshToken;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
public class RefreshService {
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder encoder =
            Base64.getUrlEncoder().withoutPadding();

    @Autowired
    private RefreshRepository refreshRepository;

    public String createRefreshToken(Long userId ) {
        Refresh refresh = new Refresh();
        refresh.setUserId(userId);
        String refreshToken = generate();
        refresh.setRefreshToken(refreshToken);
        refresh.setCreatedAt(Instant.now());
        refresh.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS));
        refreshRepository.save(refresh);
        return refreshToken;
    }

    public Refresh findRefreshByRefreshToken(String refreshToken) {
        return refreshRepository.findByRefreshToken(refreshToken).orElse(null);
    }
    public static String generate() {
        byte[] bytes = new byte[32]; // 256-bit entropy
        secureRandom.nextBytes(bytes);

        return encoder.encodeToString(bytes);
    }
}
