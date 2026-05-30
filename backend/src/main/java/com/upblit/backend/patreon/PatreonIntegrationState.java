package com.upblit.backend.patreon;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "patreon_integration_state")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatreonIntegrationState {
    @Id
    private String id;

    private String campaignId;
    private String accessToken;
    private String refreshToken;
    private Instant accessTokenExpiresAt;
    private Instant lastSyncedAt;
}