package com.upblit.backend.billing;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Table(name = "invoices")
@Data
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String plan;

    private double amount;

    private Instant periodStart;

    private Instant periodEnd;

    private Instant createdAt;

    @Column(length = 2000)
    private String storageUrl;
}
