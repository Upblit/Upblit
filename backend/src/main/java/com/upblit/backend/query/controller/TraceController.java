package com.upblit.backend.query.controller;

import com.upblit.backend.query.dto.PaginatedResponse;
import com.upblit.backend.query.model.Trace;
import com.upblit.backend.query.service.ProjectAccessService;
import com.upblit.backend.query.service.TraceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/query/traces")
@RequiredArgsConstructor
public class TraceController {

    private final TraceService traceService;
    private final ProjectAccessService projectAccessService;

    @GetMapping
    public ResponseEntity<?> getTraces(
            @RequestParam(required = true) Long projectId,
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
                return ResponseEntity.ok(traceService.getTracesByProjectAndApplicationAndTimeRangePaginated(projectId, applicationId, start, end, page, size));
            }
            if (projectId != null && applicationId != null) {
                return ResponseEntity.ok(traceService.getTracesByProjectAndApplicationPaginated(projectId, applicationId, page, size));
            }
            if (projectId != null && start != null && end != null) {
                return ResponseEntity.ok(traceService.getTracesByProjectIdAndTimeRangePaginated(projectId, start, end, page, size));
            }
            return ResponseEntity.ok(traceService.getTracesByProjectIdPaginated(projectId, page, size));
        }

        // Fallback to non-paginated (backward compatibility)
        if (projectId != null && applicationId != null && start != null && end != null) {
            return ResponseEntity.ok(traceService.getTracesByProjectAndApplicationAndTimeRange(projectId, applicationId, start, end));
        }
        if (projectId != null && applicationId != null) {
            return ResponseEntity.ok(traceService.getTracesByProjectAndApplication(projectId, applicationId));
        }
        if (projectId != null && start != null && end != null) {
            return ResponseEntity.ok(traceService.getTracesByProjectIdAndTimeRange(projectId, start, end));
        }
        return ResponseEntity.ok(traceService.getTracesByProjectId(projectId));
    }

    @GetMapping("/by-trace-id/{traceId}")
    public ResponseEntity<Trace> getByTraceId(
            @PathVariable String traceId,
            @RequestParam Long projectId
    ) {
        projectAccessService.validateProjectAccess(projectId);
        return traceService.getTraceByProjectIdAndTraceId(projectId, traceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/errors")
    public ResponseEntity<?> getErrorTraces(
            @RequestParam Long projectId,
            @RequestParam(defaultValue = "400") int status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        projectAccessService.validateProjectAccess(projectId);
        
        // If pagination params are provided, return paginated response
        if (page >= 0 && size > 0) {
            return ResponseEntity.ok(traceService.getTracesByProjectIdAndResponseStatusGreaterThanEqualPaginated(projectId, status, page, size));
        }
        
        // Fallback to non-paginated
        return ResponseEntity.ok(traceService.getTracesByProjectIdAndResponseStatusGreaterThanEqual(projectId, status));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countByProjectId(@RequestParam Long projectId) {
        projectAccessService.validateProjectAccess(projectId);
        return ResponseEntity.ok(Map.of("count", traceService.countTracesByProjectId(projectId)));
    }
}