package com.upblit.backend.uptime.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "uptime_monitors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UptimeMonitor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url", nullable = false, columnDefinition = "text")
    private String url;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "current_status", nullable = false)
    private String currentStatus;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "last_check_at")
    private Instant lastCheckAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (currentStatus == null || currentStatus.isBlank()) {
            currentStatus = "unknown";
        }
        if (active == null) {
            active = true;
        }
        if (applicationId == null) {
            applicationId = 0L;
        }
        if (organizationId == null) {
            organizationId = 0L;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}