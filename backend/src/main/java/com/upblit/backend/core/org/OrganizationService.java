package com.upblit.backend.core.org;

import com.upblit.backend.core.Organization;
import com.upblit.backend.core.OrganizationRepository;
import com.upblit.backend.core.Project;
import com.upblit.backend.core.ProjectRepository;
import com.upblit.backend.core.Application;
import com.upblit.backend.core.ApplicationsRepository;
import com.upblit.backend.core.Plan;
import com.upblit.backend.core.PlanLimits;
import com.upblit.backend.core.QuotaExceededException;
import com.upblit.backend.core.User;
import com.upblit.backend.core.UserRepository;
import com.upblit.backend.core.application.TelemetryPurger;
import com.upblit.backend.security.UserdataUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrganizationService {
    private static final int MAX_SUPERNOVA_ORGANIZATIONS = 3;
    private static final int MAX_PIRATE_ORGANIZATIONS = 1;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ApplicationsRepository applicationsRepository;

    @Autowired
    private TelemetryPurger telemetryPurger;

    public Organization create(OrganizationDTO  orgDTO, String logoUrl) {
        User user = userRepository.findById(UserdataUtil.getCurrentUserId()).orElse(null);
        if (user == null) {
            throw new IllegalStateException("Current user not found");
        }

        Plan accountPlan = resolveAccountPlan(user);
        Plan requestedPlan = orgDTO.getPlan() == null ? Plan.PIRATES : orgDTO.getPlan();
        enforceCreationQuota(user, accountPlan, requestedPlan);

        Organization organization = new Organization();
        organization.setName(orgDTO.getName());
        organization.setPlan(requestedPlan);
        organization.setLogoUrl(logoUrl);
        organization.setCreatedBy(user);
        organization.setUsers(List.of(user));
        organization.setCreatedDate(Instant.now());
        return organizationRepository.save(organization);
    }

    public ResponseEntity<?> update(Long id, OrganizationDTO orgDTO, String logoUrl) {
        Organization organization = organizationRepository.findByIdAndUsersId(id, UserdataUtil.getCurrentUserId()).orElse(null);
        if (organization == null) {
            return ResponseEntity.notFound().build();
        }

        if (orgDTO.getName() != null) {
            organization.setName(orgDTO.getName());
        }

        if (orgDTO.getPlan() != null) {
            organization.setPlan(orgDTO.getPlan());
        }

        if (logoUrl != null) {
            organization.setLogoUrl(logoUrl);
        }

        return ResponseEntity.ok(organizationRepository.save(organization));
    }
    public List<Organization> findAll() {
        return organizationRepository.findByUsersId(UserdataUtil.getCurrentUserId());
    }

    @Transactional
    public Organization addUserToOrganization(Long organizationId, Long userId) {
        Organization organization = organizationRepository.findById(organizationId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);

        if (organization == null || user == null) {
            return null;
        }

        List<User> users = organization.getUsers();
        if (users == null) {
            users = new ArrayList<>();
        }

        boolean alreadyMember = users.stream().anyMatch(existingUser -> existingUser.getId().equals(userId));
        if (alreadyMember) {
            return organization;
        }

        // --- Quota check ---
        Plan plan = organization.getPlan() != null ? organization.getPlan() : Plan.PIRATES;
        PlanLimits limits = PlanLimits.of(plan);
        if (users.size() >= limits.maxMembersPerOrg) {
            throw new QuotaExceededException(
                "members",
                users.size(),
                limits.maxMembersPerOrg,
                plan
            );
        }

        users.add(user);
        organization.setUsers(users);
        return organizationRepository.save(organization);
    }

    @Transactional
    public ResponseEntity<?> delete(Long id){
        Organization organization = organizationRepository.findByIdAndUsersId(id, UserdataUtil.getCurrentUserId()).orElse(null);
        if (organization == null) {
            return ResponseEntity.notFound().build();
        }

        List<Project> projects = projectRepository.findByOrganizationId(id);
        int deletedProjects = 0;
        int deletedApplications = 0;

        for (Project project : projects) {
            List<Application> applications = applicationsRepository.findByProjectId(project.getId()).orElse(List.of());
            for (Application application : applications) {
                telemetryPurger.purgeTelemetry(application.getId());
                applicationsRepository.delete(application);
                deletedApplications++;
            }

            projectRepository.delete(project);
            deletedProjects++;
        }

        organizationRepository.delete(organization);

        return ResponseEntity.ok().body(java.util.Map.of(
                "organizationId", id,
                "projectsDeleted", deletedProjects,
                "applicationsDeleted", deletedApplications
        ));
    }

    private void enforceCreationQuota(User user, Plan accountPlan, Plan requestedPlan) {
        List<Organization> organizations = organizationRepository.findByUsersId(user.getId());
        long pirateOrganizations = organizations.stream().filter(organization -> organization.getPlan() == Plan.PIRATES).count();
        long supernovaOrganizations = organizations.stream().filter(organization -> organization.getPlan() == Plan.SUPERNOVA).count();

        switch (accountPlan) {
            case WARLORD -> {
                return;
            }
            case SUPERNOVA -> {
                if (requestedPlan == Plan.PIRATES) {
                    if (pirateOrganizations >= MAX_PIRATE_ORGANIZATIONS) {
                        throw new IllegalArgumentException("SuperNova users can create only one Pirate organization.");
                    }
                    return;
                }

                if (requestedPlan == Plan.SUPERNOVA) {
                    if (supernovaOrganizations >= MAX_SUPERNOVA_ORGANIZATIONS) {
                        throw new IllegalArgumentException("SuperNova users can create up to three SuperNova organizations.");
                    }
                    return;
                }

                throw new IllegalArgumentException("SuperNova users can only create Pirate or SuperNova organizations.");
            }
            case PIRATES -> {
                if (requestedPlan != Plan.PIRATES) {
                    throw new IllegalArgumentException("Pirate users can only create Pirate organizations.");
                }

                if (pirateOrganizations >= MAX_PIRATE_ORGANIZATIONS) {
                    throw new IllegalArgumentException("Pirate users can create only one Pirate organization.");
                }
            }
        }
    }

    private Plan resolveAccountPlan(User user) {
        if (user.getPlan() == null || user.getPlan().isBlank()) {
            return Plan.PIRATES;
        }

        try {
            return Plan.valueOf(user.getPlan());
        } catch (IllegalArgumentException ex) {
            return Plan.PIRATES;
        }
    }
}
