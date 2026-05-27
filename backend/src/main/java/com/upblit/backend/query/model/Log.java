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
@Document(collection = "logs")
public class Log {

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

    @Field("trace_id")
    private String traceId;

    @Field("level")
    private String level;

    @Field("type")
    private String type;

    @Field("message")
    private String message;

    @Field("timestamp")
    private Instant timestamp;
}
