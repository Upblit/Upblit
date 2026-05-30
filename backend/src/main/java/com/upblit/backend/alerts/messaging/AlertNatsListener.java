package com.upblit.backend.alerts.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.upblit.backend.alerts.model.AlertEvent;
import com.upblit.backend.alerts.service.AlertService;
import io.nats.client.Connection;
import io.nats.client.Dispatcher;
import io.nats.client.Message;
import io.nats.client.Nats;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Component
@RequiredArgsConstructor
public class AlertNatsListener {
    private static final Logger log = LoggerFactory.getLogger(AlertNatsListener.class);

    private final AlertService alertService;
    private final ObjectMapper objectMapper;

    @Value("${app.nats.url}")
    private String natsUrl;

    @Value("${app.nats.alert-subject}")
    private String alertSubject;

    private Connection connection;

    @PostConstruct
    public void start() {
        try {
            connection = Nats.connect(natsUrl);
            Dispatcher dispatcher = connection.createDispatcher(this::handleAlertMessage);
            dispatcher.subscribe(alertSubject);
            connection.flush(Duration.ofSeconds(1));
            log.info("Subscribed to NATS alert subject {}", alertSubject);
        } catch (Exception exception) {
            if (connection != null) {
                try {
                    connection.close();
                } catch (Exception closeException) {
                    log.debug("Failed to close NATS connection after startup error", closeException);
                }
                connection = null;
            }
            log.warn("NATS alert listener disabled because startup failed for subject {}", alertSubject, exception);
        }
    }

    private void handleAlertMessage(Message message) {
        try {
            AlertEvent alertEvent = objectMapper.readValue(message.getData(), AlertEvent.class);
            if (alertEvent.getSubject() == null || alertEvent.getSubject().isBlank()) {
                alertEvent.setSubject(message.getSubject());
            }
            alertService.record(alertEvent);
        } catch (Exception exception) {
            log.warn(
                    "Failed to process alert message on {}: {}",
                    message.getSubject(),
                    new String(message.getData(), StandardCharsets.UTF_8),
                    exception
            );
        }
    }

    @PreDestroy
    public void stop() throws InterruptedException {
        if (connection != null) {
            connection.close();
        }
    }
}