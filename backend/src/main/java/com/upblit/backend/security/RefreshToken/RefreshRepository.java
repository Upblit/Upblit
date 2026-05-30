package com.upblit.backend.security.RefreshToken;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshRepository extends JpaRepository<Refresh, Long> {
    Optional<Refresh> findByRefreshToken(String refreshToken);
    void deleteAllByUserId(Long userId);
}
