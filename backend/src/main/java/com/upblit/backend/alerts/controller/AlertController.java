package com.upblit.backend.alerts.controller;

import com.upblit.backend.alerts.model.AlertEvent;
import com.upblit.backend.alerts.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
public class AlertController {
    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<AlertEvent>> listAlerts(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "100") int limit
    ) {
        return ResponseEntity.ok(alertService.listAlerts(projectId, severity, limit));
    }
}