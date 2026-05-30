package com.upblit.backend.alerts.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Document(collection = "alerts")
public class AlertEvent {
    @Id
    private String id;

    @Field("subject")
    private String subject;

    @Field("source")
    private String source;

    @Field("kind")
    private String kind;

    @Field("severity")
    private String severity;

    @Field("title")
    private String title;

    @Field("message")
    private String message;

    @Field("projectId")
    private Long projectId;

    @Field("applicationId")
    private Long applicationId;

    @Field("monitorId")
    private Long monitorId;

    @Field("detectedAt")
    private Instant detectedAt;

    @Field("createdAt")
    private Instant createdAt;

    @Field("metadata")
    private Map<String, Object> metadata;
}