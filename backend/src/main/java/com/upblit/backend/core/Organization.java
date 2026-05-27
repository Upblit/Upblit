package com.upblit.backend.core;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.upblit.backend.ai.Tenant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Enumerated(EnumType.STRING)
    private Plan plan;
    private String logoUrl;
    private Instant createdDate;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;
    @ManyToMany
    @JoinTable(
            name = "organization_users",
            joinColumns = @JoinColumn(name = "organization_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> users;

    @OneToMany(mappedBy = "organization")
    @JsonIgnore
    private List<Project> projects;

    @OneToMany(mappedBy = "organization")
    @JsonIgnore
    private List<Tenant> tenants;


}
