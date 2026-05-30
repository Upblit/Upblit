package com.upblit.backend.patreon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatreonIntegrationStateRepository extends JpaRepository<PatreonIntegrationState, String> {
}