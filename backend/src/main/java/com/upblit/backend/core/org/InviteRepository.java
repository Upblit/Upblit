package com.upblit.backend.core.org;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InviteRepository extends JpaRepository<Invite, UUID> {

    Optional<Invite> findByUserId(Long userId);

    Optional<Invite> findByPublicToken(String publicToken);

    List<Invite> findAllByOrganizationId(Long organizationId);

    List<Invite> findAllByOrganizationIdAndActive(Long organizationId, boolean active);

    List<Invite> findAllByIdAndUserId(UUID id, Long userId);

    void deleteAllByOrganizationId(Long organizationId);

    void deleteAllByUserId(Long userId);
}