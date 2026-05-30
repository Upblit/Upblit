package com.upblit.backend.query.controller;

import com.upblit.backend.query.model.Metrics;
import com.upblit.backend.query.service.MetricsService;
import com.upblit.backend.query.ProjectAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/query/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;
    private final ProjectAccessService projectAccessService;

    @GetMapping
    public ResponseEntity<?> getMetrics(
            @RequestParam Long projectId,
            @RequestParam(required = false) Long applicationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        projectAccessService.validateProjectAccess(projectId);

        // If pagination params are provided, return paginated response
        if (page >= 0 && size > 0) {
            if (projectId != null && applicationId != null && start != null && end != null) {
                return ResponseEntity.ok(metricsService.getMetricsByProjectAndApplicationAndTimeRangePaginated(projectId, applicationId, start, end, page, size));
            }
            if (projectId != null && applicationId != null) {
                return ResponseEntity.ok(metricsService.getMetricsByProjectAndApplicationPaginated(projectId, applicationId, page, size));
            }
            if (projectId != null && start != null && end != null) {
                return ResponseEntity.ok(metricsService.getMetricsByProjectIdAndTimeRangePaginated(projectId, start, end, page, size));
            }
            return ResponseEntity.ok(metricsService.getMetricsByProjectIdPaginated(projectId, page, size));
        }

        // Fallback to non-paginated (backward compatibility)
        if (projectId != null && applicationId != null && start != null && end != null) {
            return ResponseEntity.ok(metricsService.getMetricsByProjectAndApplicationAndTimeRange(projectId, applicationId, start, end));
        }
        if (projectId != null && applicationId != null) {
            return ResponseEntity.ok(metricsService.getMetricsByProjectAndApplication(projectId, applicationId));
        }
        if (projectId != null && start != null && end != null) {
            return ResponseEntity.ok(metricsService.getMetricsByProjectIdAndTimeRange(projectId, start, end));
        }
        return ResponseEntity.ok(metricsService.getMetricsByProjectId(projectId));
    }

    @GetMapping("/latest")
    public ResponseEntity<Metrics> getLatestMetrics(
            @RequestParam Long projectId,
            @RequestParam(required = false) Long applicationId
    ) {
        projectAccessService.validateProjectAccess(projectId);

        if (applicationId != null) {
            return metricsService.getLatestMetricsByProjectAndApplicationId(projectId, applicationId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
        return metricsService.getLatestMetricsByProjectId(projectId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}