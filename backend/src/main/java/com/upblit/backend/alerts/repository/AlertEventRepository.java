package com.upblit.backend.alerts.repository;

import com.upblit.backend.alerts.model.AlertEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AlertEventRepository extends MongoRepository<AlertEvent, String> {
    Page<AlertEvent> findAllByOrderByDetectedAtDesc(Pageable pageable);

    Page<AlertEvent> findByProjectIdOrderByDetectedAtDesc(Long projectId, Pageable pageable);

    Page<AlertEvent> findByProjectIdAndSeverityOrderByDetectedAtDesc(Long projectId, String severity, Pageable pageable);

    Page<AlertEvent> findBySeverityOrderByDetectedAtDesc(String severity, Pageable pageable);
}