package com.upblit.backend.core;

/**
 * Thrown when a plan quota is exceeded.
 * Carries structured context so the API response can tell the client
 * exactly which resource hit its limit and what the limit is.
 */
public class QuotaExceededException extends RuntimeException {

    private final String resource;
    private final int current;
    private final int limit;
    private final Plan plan;

    public QuotaExceededException(String resource, int current, int limit, Plan plan) {
        super(String.format(
            "Quota exceeded for '%s': %d / %d on plan %s. Upgrade to increase this limit.",
            resource, current, limit, plan.name()
        ));
        this.resource = resource;
        this.current = current;
        this.limit = limit;
        this.plan = plan;
    }

    public String getResource() { return resource; }
    public int getCurrent()     { return current; }
    public int getLimit()       { return limit; }
    public Plan getPlan()       { return plan; }
}
