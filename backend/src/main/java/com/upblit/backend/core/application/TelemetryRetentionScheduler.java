package com.upblit.backend.core.application;

import com.upblit.backend.core.Application;
import com.upblit.backend.core.Organization;
import com.upblit.backend.core.OrganizationRepository;
import com.upblit.backend.core.Plan;
import com.upblit.backend.core.Project;
import com.upblit.backend.core.ProjectRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
public class TelemetryRetentionScheduler {

    private final OrganizationRepository organizationRepository;
    private final ProjectRepository projectRepository;
    private final TelemetryPurger telemetryPurger;

    public TelemetryRetentionScheduler(
            OrganizationRepository organizationRepository,
            ProjectRepository projectRepository,
            TelemetryPurger telemetryPurger
    ) {
        this.organizationRepository = organizationRepository;
        this.projectRepository = projectRepository;
        this.telemetryPurger = telemetryPurger;
    }

    // Run daily at 02:15 UTC to keep retention cleanup away from the billing run.
    @Scheduled(cron = "0 15 2 * * *")
    public void cleanupTelemetryRetention() {
        Instant now = Instant.now();

        for (Organization organization : organizationRepository.findAll()) {
            int retentionDays = retentionDaysForPlan(organization.getPlan());
            Instant cutoff = now.minus(retentionDays, ChronoUnit.DAYS);

            List<Project> projects = projectRepository.findByOrganizationId(organization.getId());
            Set<Long> projectIds = new LinkedHashSet<>();
            for (Project project : projects) {
                projectIds.add(project.getId());
            }

            if (projectIds.isEmpty()) {
                continue;
            }

            telemetryPurger.purgeTelemetryBeforeByProjectIds(projectIds, cutoff);
            telemetryPurger.purgeUptimeBeforeByProjectIds(projectIds, cutoff);
        }
    }

    private int retentionDaysForPlan(Plan plan) {
        if (plan == null) {
            return 7;
        }

        return switch (plan) {
            case PIRATES -> 7;
            case SUPERNOVA -> 30;
            case WARLORD -> 90;
        };
    }
}
