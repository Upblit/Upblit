package com.upblit.backend.core.org;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;


@Data
@Entity
@Table(name = "invite")
@AllArgsConstructor
@NoArgsConstructor
public class Invite {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = true)
    private Long userId;

    private Long organizationId;

    @Column(unique = true, nullable = false)
    private String publicToken;

    private Long createdById;
    private Instant createdAt;
    private Instant expiresAt;
    private boolean active = true;
}
