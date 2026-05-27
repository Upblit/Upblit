package com.upblit.backend.core.application;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Entity
@Table(name = "delete_jobs")
@AllArgsConstructor
@NoArgsConstructor
public class DeleteJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long applicationId;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    private String result;

    private String errorMessage;

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    public enum Status { PENDING, RUNNING, COMPLETED, FAILED }

}
