package com.upblit.backend.core.application;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import com.mongodb.client.result.DeleteResult;

import java.time.Instant;
import java.util.Collection;
import java.util.Map;

@Component
public class TelemetryPurger {
    @Autowired
    private MongoTemplate mongoTemplate;

    public Map<String, Long> purgeTelemetry(Long applicationId) {
        Query q = new Query(Criteria.where("applicationId").is(applicationId));
        DeleteResult mres = mongoTemplate.getCollection("metrics").deleteMany(q.getQueryObject());
        DeleteResult tres = mongoTemplate.getCollection("traces").deleteMany(q.getQueryObject());
        DeleteResult lres = mongoTemplate.getCollection("logs").deleteMany(q.getQueryObject());

        return Map.of(
                "metrics", mres.getDeletedCount(),
                "traces", tres.getDeletedCount(),
                "logs", lres.getDeletedCount()
        );
    }

    public Map<String, Long> purgeTelemetryBefore(Long applicationId, Instant cutoff) {
        Query query = new Query(
                Criteria.where("applicationId").is(applicationId)
                        .and("timestamp").lt(cutoff)
        );
        DeleteResult mres = mongoTemplate.getCollection("metrics").deleteMany(query.getQueryObject());
        DeleteResult tres = mongoTemplate.getCollection("traces").deleteMany(query.getQueryObject());
        DeleteResult lres = mongoTemplate.getCollection("logs").deleteMany(query.getQueryObject());

        return Map.of(
                "metrics", mres.getDeletedCount(),
                "traces", tres.getDeletedCount(),
                "logs", lres.getDeletedCount()
        );
    }

    public Map<String, Long> purgeTelemetryBeforeByProjectIds(Collection<Long> projectIds, Instant cutoff) {
        Query query = new Query(
                Criteria.where("projectId").in(projectIds)
                        .and("timestamp").lt(cutoff)
        );
        DeleteResult mres = mongoTemplate.getCollection("metrics").deleteMany(query.getQueryObject());
        DeleteResult tres = mongoTemplate.getCollection("traces").deleteMany(query.getQueryObject());
        DeleteResult lres = mongoTemplate.getCollection("logs").deleteMany(query.getQueryObject());

        return Map.of(
                "metrics", mres.getDeletedCount(),
                "traces", tres.getDeletedCount(),
                "logs", lres.getDeletedCount()
        );
    }

    public long purgeUptimeBefore(Long projectId, Instant cutoff) {
        Query query = new Query(
                Criteria.where("projectId").is(projectId)
                        .and("timestamp").lt(cutoff)
        );
        return mongoTemplate.getCollection("uptime").deleteMany(query.getQueryObject()).getDeletedCount();
    }

    public long purgeUptimeBeforeByProjectIds(Collection<Long> projectIds, Instant cutoff) {
        Query query = new Query(
                Criteria.where("projectId").in(projectIds)
                        .and("timestamp").lt(cutoff)
        );
        return mongoTemplate.getCollection("uptime").deleteMany(query.getQueryObject()).getDeletedCount();
    }
}
