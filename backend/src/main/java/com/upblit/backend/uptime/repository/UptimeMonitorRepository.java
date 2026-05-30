package com.upblit.backend.uptime.repository;

import com.upblit.backend.uptime.model.UptimeMonitor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UptimeMonitorRepository extends JpaRepository<UptimeMonitor, Long> {
    List<UptimeMonitor> findByProjectIdOrderByUpdatedAtDesc(Long projectId);

    java.util.Optional<UptimeMonitor> findByProjectIdAndApplicationId(Long projectId, Long applicationId);

    boolean existsByProjectIdAndApplicationId(Long projectId, Long applicationId);
}