package com.upblit.backend.core;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByGithubId(String githubId);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByPatreonUserId(String patreonUserId);
    Optional<User> findByPatreonEmail(String patreonEmail);
    List<User> findByPatreonLinkedTrue();
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailVerificationToken(String emailVerificationToken);
    Optional<User> findByUsername(String username);
}

