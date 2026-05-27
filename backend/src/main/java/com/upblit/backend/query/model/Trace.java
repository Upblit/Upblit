package com.upblit.backend.query.model;

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
@Document(collection = "traces")
public class Trace {

    @Id
    private String id;

    @Field("clientTimestamp")
    private Instant clientTimestamp;

    @Field("serverTimestamp")
    private Instant serverTimestamp;

    @Field("projectId")
    private Long projectId;

    @Field("applicationId")
    private Long applicationId;

    @Field("requestMethod")
    private String requestMethod;

    @Field("requestURL")
    private String requestURL;

    @Field("responseStatus")
    private Integer responseStatus;

    @Field("traceId")
    private String traceId;

    @Field("spanType")
    private String spanType;

    @Field("spanId")
    private String spanId;

    @Field("parentSpanId")
    private String parentSpanId;

    @Field("durationMs")
    private Long durationMs;

    @Field("timestamp")
    private Instant timestamp;

    @Field("meta")
    private Map<String, String> meta;
}
