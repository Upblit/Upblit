package com.upblit.backend.ai;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocRepository extends JpaRepository<Doc,Long> {
    Optional<Doc> findById(long id);
    Optional<Doc> findByTenantId(long tenantId);
    void deleteAllByTenantId(Long tenantId);
}
