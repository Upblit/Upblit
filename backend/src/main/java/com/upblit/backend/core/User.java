package com.upblit.backend.core;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.upblit.backend.core.Plan;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String githubId;

    @Column(unique = true)
    private String googleId;

    @Column(unique = true)
    private String patreonUserId;

    @Column(unique = true)
    private String email;

    private String authProvider;
    private String passwordHash;
    private boolean emailVerified;
    private String emailVerificationToken;
    private Instant emailVerificationTokenExpiresAt;

    private String plan = Plan.PIRATES.name();
    private String username;
    private String avatarUrl;

    private String patreonEmail;
    private String patreonMembershipStatus;
    private boolean patreonLinked;
    private Instant patreonLastSyncedAt;

    @Transient
    private String accessToken;

    private Instant lastLogin;
    private Instant lastBilledAt;
    private Double warlordAmount;

    @ManyToMany(mappedBy = "users")
    @JsonIgnore
    private List<Organization> organizations;
}

