package com.upblit.backend.core.application;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import com.mongodb.client.result.DeleteResult;

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
}
