package com.upblit.backend.uptime.repository;

import com.upblit.backend.uptime.model.UptimeCheckResult;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface UptimeCheckResultRepository extends MongoRepository<UptimeCheckResult, String> {
    List<UptimeCheckResult> findByMonitorIdOrderByTimestampDesc(String monitorId);

    List<UptimeCheckResult> findByMonitorIdAndTimestampGreaterThanEqualOrderByTimestampDesc(String monitorId, Instant from);

    List<UptimeCheckResult> findByMonitorIdAndTimestampLessThanEqualOrderByTimestampDesc(String monitorId, Instant to);

    List<UptimeCheckResult> findByMonitorIdAndTimestampBetweenOrderByTimestampDesc(String monitorId, Instant from, Instant to);
}