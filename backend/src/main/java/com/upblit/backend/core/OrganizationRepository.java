package com.upblit.backend.core;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    @Override
    Optional<Organization> findById(Long id);

    Optional<Organization> findByIdAndUsersId(Long  id, Long userId);

    List<Organization> findByUsersId(Long userId);
    List<Organization> findByCreatedById(Long userId);
}
