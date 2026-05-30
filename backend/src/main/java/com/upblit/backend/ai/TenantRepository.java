package com.upblit.backend.ai;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant,Long> {
    Optional<Tenant> findById(Long Id);
    Optional<Tenant> findByOrganizationIdAndName(Long OrganizationId, String name);
    Optional<Tenant> findByIdAndOrganizationId(Long Id,Long OrganizationId);
    Optional<Tenant> findByIdAndOrganizationUsersId(Long id, Long users_id);
    void deleteAllByOrganizationId(Long organizationId);
}
