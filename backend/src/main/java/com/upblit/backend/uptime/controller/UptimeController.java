package com.upblit.backend.uptime.controller;

import com.upblit.backend.uptime.dto.CreateMonitorRequest;
import com.upblit.backend.uptime.model.UptimeCheckResult;
import com.upblit.backend.uptime.model.UptimeMonitor;
import com.upblit.backend.uptime.service.UptimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/uptime")
@RequiredArgsConstructor
public class UptimeController {
    private final UptimeService uptimeService;

    @PostMapping("/monitors")
    public ResponseEntity<UptimeMonitor> createMonitor(@Valid @RequestBody CreateMonitorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(uptimeService.createMonitor(request));
    }

    @GetMapping("/monitors")
    public ResponseEntity<List<UptimeMonitor>> listMonitors(@RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(uptimeService.listMonitors(projectId));
    }

    @PutMapping("/monitors/{monitorId}")
    public ResponseEntity<UptimeMonitor> updateMonitor(
            @PathVariable Long monitorId,
            @Valid @RequestBody CreateMonitorRequest request
    ) {
        return ResponseEntity.ok(uptimeService.updateMonitor(monitorId, request));
    }

    @DeleteMapping("/monitors/{monitorId}")
    public ResponseEntity<Void> deleteMonitor(@PathVariable Long monitorId) {
        uptimeService.deleteMonitor(monitorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/monitors/{monitorId}/results")
    public ResponseEntity<List<UptimeCheckResult>> getMonitorResults(
            @PathVariable Long monitorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        return ResponseEntity.ok(uptimeService.getMonitorResults(monitorId, from, to));
    }
}