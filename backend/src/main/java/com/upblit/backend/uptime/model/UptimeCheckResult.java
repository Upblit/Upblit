package com.upblit.backend.uptime.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "uptime")
public class UptimeCheckResult {
    @Id
    private String id;

    @Field("monitorId")
    private String monitorId;

    @Field("projectId")
    private Long projectId;

    @Field("url")
    private String url;

    @Field("timestamp")
    private Instant timestamp;

    @Field("responseMs")
    private Long responseMs;

    @Field("statusCode")
    private Integer statusCode;

    @Field("success")
    private Boolean success;

    @Field("error")
    private String error;
}