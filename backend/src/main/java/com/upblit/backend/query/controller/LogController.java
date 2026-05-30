package com.upblit.backend.query.controller;

import com.upblit.backend.query.service.LogService;
import com.upblit.backend.query.ProjectAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/query/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;
    private final ProjectAccessService projectAccessService;

    @GetMapping
    public ResponseEntity<?> getLogs(
            @RequestParam Long projectId,
            @RequestParam(required = false) Long applicationId,
            @RequestParam(required = false) String traceId,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        projectAccessService.validateProjectAccess(projectId);

        // If pagination params are provided, return paginated response
        if (page >= 0 && size > 0) {
            if (traceId != null) {
                return ResponseEntity.ok(logService.getLogsByProjectIdAndTraceIdPaginated(projectId, traceId, page, size));
            }
            if (level != null) {
                return ResponseEntity.ok(logService.getLogsByProjectIdAndLevelPaginated(projectId, level, page, size));
            }
            if (projectId != null && applicationId != null && start != null && end != null) {
                return ResponseEntity.ok(logService.getLogsByProjectAndApplicationAndTimeRangePaginated(projectId, applicationId, start, end, page, size));
            }
            if (projectId != null && applicationId != null) {
                return ResponseEntity.ok(logService.getLogsByProjectAndApplicationPaginated(projectId, applicationId, page, size));
            }
            if (projectId != null && start != null && end != null) {
                return ResponseEntity.ok(logService.getLogsByProjectIdAndTimeRangePaginated(projectId, start, end, page, size));
            }
            return ResponseEntity.ok(logService.getLogsByProjectIdPaginated(projectId, page, size));
        }

        // Fallback to non-paginated (backward compatibility)
        if (traceId != null) {
            return ResponseEntity.ok(logService.getLogsByProjectIdAndTraceId(projectId, traceId));
        }
        if (level != null) {
            return ResponseEntity.ok(logService.getLogsByProjectIdAndLevel(projectId, level));
        }
        if (projectId != null && applicationId != null && start != null && end != null) {
            return ResponseEntity.ok(logService.getLogsByProjectAndApplicationAndTimeRange(projectId, applicationId, start, end));
        }
        if (projectId != null && applicationId != null) {
            return ResponseEntity.ok(logService.getLogsByProjectAndApplication(projectId, applicationId));
        }
        if (projectId != null && start != null && end != null) {
            return ResponseEntity.ok(logService.getLogsByProjectIdAndTimeRange(projectId, start, end));
        }
        return ResponseEntity.ok(logService.getLogsByProjectId(projectId));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countByLevel(
            @RequestParam Long projectId,
            @RequestParam String level
    ) {
        projectAccessService.validateProjectAccess(projectId);
        return ResponseEntity.ok(Map.of("count", logService.countLogsByProjectIdAndLevel(projectId, level)));
    }
}