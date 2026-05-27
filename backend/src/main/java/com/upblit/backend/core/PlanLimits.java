package com.upblit.backend.core;

/**
 * Defines resource quotas for each Plan tier.
 * All quota checks across the codebase must read from here — never hardcode limits in services.
 *
 * PIRATES   → free tier
 * SUPERNOVA → pro tier
 * WARLORD   → enterprise (unlimited)
 *
 * maxApplicationsPerOrg: total applications allowed across ALL projects in one org.
 */
public enum PlanLimits {

    PIRATES(
        5,   // maxMembersPerOrg
        3,   // maxProjectsPerOrg
        10,  // maxApplicationsPerProject
        10   // maxApplicationsPerOrg
    ),

    SUPERNOVA(
        20,  // maxMembersPerOrg
        10,  // maxProjectsPerOrg
        50,  // maxApplicationsPerProject
        50   // maxApplicationsPerOrg
    ),

    WARLORD(
        Integer.MAX_VALUE,
        Integer.MAX_VALUE,
        Integer.MAX_VALUE,
        Integer.MAX_VALUE
    );

    public final int maxMembersPerOrg;
    public final int maxProjectsPerOrg;
    public final int maxApplicationsPerProject;
    public final int maxApplicationsPerOrg;

    PlanLimits(int maxMembersPerOrg, int maxProjectsPerOrg, int maxApplicationsPerProject, int maxApplicationsPerOrg) {
        this.maxMembersPerOrg = maxMembersPerOrg;
        this.maxProjectsPerOrg = maxProjectsPerOrg;
        this.maxApplicationsPerProject = maxApplicationsPerProject;
        this.maxApplicationsPerOrg = maxApplicationsPerOrg;
    }

    /** Resolve limits from a Plan enum value. */
    public static PlanLimits of(Plan plan) {
        return PlanLimits.valueOf(plan.name());
    }
}
