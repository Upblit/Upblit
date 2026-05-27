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
    private String plan = Plan.PIRATES.name();
    private String username;
    private String email;
    private String avatarUrl;

    @Column(length = 1000)
    private String accessToken;

    private Instant lastLogin;

    @ManyToMany(mappedBy = "users")
    @JsonIgnore
    private List<Organization> organizations;
}

