package com.upblit.backend.security;

import com.upblit.backend.security.RefreshToken.Refresh;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<Refresh, Long> {
    Optional<Refresh> findByRefreshToken(String refreshToken);
    void deleteAllByUserId(Long userId);
}
