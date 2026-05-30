package com.upblit.backend.uptime.service;

import com.upblit.backend.query.ProjectAccessService;
import com.upblit.backend.uptime.dto.CreateMonitorRequest;
import com.upblit.backend.uptime.model.UptimeCheckResult;
import com.upblit.backend.uptime.model.UptimeMonitor;
import com.upblit.backend.uptime.repository.UptimeCheckResultRepository;
import com.upblit.backend.uptime.repository.UptimeMonitorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.net.URI;

@Service
@RequiredArgsConstructor
public class UptimeService {
    private final UptimeMonitorRepository monitorRepository;
    private final UptimeCheckResultRepository resultRepository;
    private final ProjectAccessService projectAccessService;

    public UptimeMonitor createMonitor(CreateMonitorRequest request) {
        projectAccessService.validateProjectAccess(request.getProjectId());

        if (request.getApplicationId() != null
                && monitorRepository.existsByProjectIdAndApplicationId(request.getProjectId(), request.getApplicationId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This application already has an uptime monitor");
        }

        UptimeMonitor monitor = UptimeMonitor.builder()
            .url(normalizeHealthUrl(request.getUrl()))
                .projectId(request.getProjectId())
                .applicationId(request.getApplicationId() == null ? 0L : request.getApplicationId())
                .organizationId(request.getOrganizationId() == null ? 0L : request.getOrganizationId())
                .currentStatus("unknown")
                .active(request.getActive() == null ? true : request.getActive())
                .build();

        return monitorRepository.save(monitor);
    }

    public List<UptimeMonitor> listMonitors(Long projectId) {
        if (projectId == null) {
            return monitorRepository.findAll(Sort.by(Sort.Direction.DESC, "updatedAt"));
        }

        projectAccessService.validateProjectAccess(projectId);
        return monitorRepository.findByProjectIdOrderByUpdatedAtDesc(projectId);
    }

    public List<UptimeCheckResult> getMonitorResults(Long monitorId, Instant from, Instant to) {
        UptimeMonitor monitor = monitorRepository.findById(monitorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));

        projectAccessService.validateProjectAccess(monitor.getProjectId());

        String monitorKey = String.valueOf(monitorId);

        if (from != null && to != null) {
            return resultRepository.findByMonitorIdAndTimestampBetweenOrderByTimestampDesc(monitorKey, from, to);
        }
        if (from != null) {
            return resultRepository.findByMonitorIdAndTimestampGreaterThanEqualOrderByTimestampDesc(monitorKey, from);
        }
        if (to != null) {
            return resultRepository.findByMonitorIdAndTimestampLessThanEqualOrderByTimestampDesc(monitorKey, to);
        }
        return resultRepository.findByMonitorIdOrderByTimestampDesc(monitorKey);
    }

    public UptimeMonitor updateMonitor(Long monitorId, CreateMonitorRequest request) {
        UptimeMonitor monitor = monitorRepository.findById(monitorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));

        projectAccessService.validateProjectAccess(monitor.getProjectId());

        monitor.setUrl(normalizeHealthUrl(request.getUrl()));
        monitor.setCurrentStatus("unknown");
        monitor.setLastCheckAt(null);
        // update active flag if provided
        if (request.getActive() != null) {
            monitor.setActive(request.getActive());
        }
        return monitorRepository.save(monitor);
    }

    public void deleteMonitor(Long monitorId) {
        UptimeMonitor monitor = monitorRepository.findById(monitorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));

        projectAccessService.validateProjectAccess(monitor.getProjectId());
        monitorRepository.delete(monitor);
    }

    public UptimeMonitor getMonitorByProjectAndApplication(Long projectId, Long applicationId) {
        projectAccessService.validateProjectAccess(projectId);
        return monitorRepository.findByProjectIdAndApplicationId(projectId, applicationId)
                .orElse(null);
    }

    private String normalizeHealthUrl(String rawUrl) {
        String value = rawUrl == null ? "" : rawUrl.trim();
        if (value.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL is required");
        }

        if (!value.matches("^[a-zA-Z][a-zA-Z0-9+.-]*://.*$")) {
            value = "https://" + value;
        }

        URI uri = URI.create(value);
        String path = uri.getPath();
        String normalizedPath;
        if (path == null || path.isBlank() || "/".equals(path)) {
            normalizedPath = "/health";
        } else {
            normalizedPath = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
        }

        try {
            URI normalized = new URI(
                    uri.getScheme(),
                    uri.getUserInfo(),
                    uri.getHost(),
                    uri.getPort(),
                    normalizedPath,
                    uri.getQuery(),
                    uri.getFragment()
            );
            return normalized.toString();
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid uptime URL");
        }
    }
}