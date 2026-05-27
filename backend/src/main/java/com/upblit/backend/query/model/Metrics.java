package com.upblit.backend.query.model;

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
@Document(collection = "metrics")
public class Metrics {

    @Id
    private String id;

    @Field("projectId")
    private Long projectId;

    @Field("applicationId")
    private Long applicationId;

    @Field("timestamp")
    private Instant timestamp; // bucket time

    @Field("requestCount")
    private Long requestCount;

    @Field("errorCount")
    private Long errorCount;

    @Field("avgLatency")
    private Double avgLatency;

    @Field("maxLatency")
    private Long maxLatency;

    @Field("minLatency")
    private Long minLatency;
}
