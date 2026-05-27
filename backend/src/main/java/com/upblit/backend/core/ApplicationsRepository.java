package com.upblit.backend.core;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationsRepository extends JpaRepository<Application, Long> {
    Optional<Application> findByProjectIdAndId(Long projectId, Long applicationId);
    Optional<Application> findById(Long applicationId);
    Optional<List<Application>> findByProjectId(Long projectId);
    Optional<Application> findByIdAndProjectOrganizationUsersId(Long appId, Long userId);
    Optional<List<Application>> findByProjectIdAndProjectOrganizationUsersId(Long projectId, Long userId);

    /** Count all applications across every project in an organization. */
    long countByProjectOrganizationId(Long organizationId);
}
