package com.upblit.backend.alerts.service;

import com.upblit.backend.alerts.model.AlertEvent;
import com.upblit.backend.alerts.repository.AlertEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {
    private final AlertEventRepository alertEventRepository;

    public AlertEvent record(AlertEvent alertEvent) {
        Instant now = Instant.now();
        if (alertEvent.getDetectedAt() == null) {
            alertEvent.setDetectedAt(now);
        }
        if (alertEvent.getCreatedAt() == null) {
            alertEvent.setCreatedAt(now);
        }
        return alertEventRepository.save(alertEvent);
    }

    public List<AlertEvent> listAlerts(Long projectId, String severity, int limit) {
        int pageSize = Math.max(1, Math.min(limit, 200));
        PageRequest pageRequest = PageRequest.of(0, pageSize, Sort.by(Sort.Direction.DESC, "detectedAt"));

        if (projectId != null && severity != null && !severity.isBlank()) {
            return alertEventRepository.findByProjectIdAndSeverityOrderByDetectedAtDesc(projectId, severity, pageRequest).getContent();
        }
        if (projectId != null) {
            return alertEventRepository.findByProjectIdOrderByDetectedAtDesc(projectId, pageRequest).getContent();
        }
        if (severity != null && !severity.isBlank()) {
            return alertEventRepository.findBySeverityOrderByDetectedAtDesc(severity, pageRequest).getContent();
        }
        return alertEventRepository.findAllByOrderByDetectedAtDesc(pageRequest).getContent();
    }
}