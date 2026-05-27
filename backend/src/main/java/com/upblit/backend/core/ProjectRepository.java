package com.upblit.backend.core;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOrganizationId(Long organizationId);

    Optional<Project> findByIdAndOrganizationId(Long id, Long organizationId);

    Optional<Project> findByApplicationsIdAndOrganizationId(Long applicationId, Long organizationId);

    boolean existsByIdAndOrganizationUsersId(Long projectId, Long userId);

}
