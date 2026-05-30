package com.upblit.backend.core.user;

import com.upblit.backend.core.*;
import com.upblit.backend.core.org.*;
import com.upblit.backend.security.UserdataUtil;
import com.upblit.backend.security.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.ArrayList;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrganizationService organizationService;
    @Autowired
    private OrganizationRepository organizationRepository;
    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;
    @Autowired
    private InviteRepository inviteRepository;
    @Autowired
    private RefreshTokenRepository refreshRepository;

    public User CreateUser(User user) {
        user.setPlan(Plan.PIRATES.name());
        return userRepository.save(user);
    }

    public User updateCurrentUser(UserDTO userDTO, String logoUrl) {
        User existing = userRepository.findById(UserdataUtil.getCurrentUserId())
                .orElseThrow(() -> new IllegalStateException("Current user not found"));

        if (userDTO.getUsername() != null) {
            existing.setUsername(userDTO.getUsername());
        }

        if (userDTO.getEmail() != null) {
            existing.setEmail(userDTO.getEmail());
        }

        if (logoUrl != null) {
            existing.setAvatarUrl(logoUrl);
        }

        return userRepository.save(existing);
    }

    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @org.springframework.transaction.annotation.Transactional
    public java.util.Map<String, Object> deleteCurrentUser() {
        Long currentUserId = UserdataUtil.getCurrentUserId();
        User user = userRepository.findById(currentUserId).orElseThrow(() -> new IllegalStateException("Current user not found"));

        java.util.List<Organization> organizations = organizationMemberRepository.findByUserId(currentUserId).stream()
            .filter(member -> member.getRole() == OrganizationRole.OWNER)
            .map(OrganizationMember::getOrganization)
            .filter(Objects::nonNull)
            .toList();

        int deletedOrgs = 0;
        for (Organization org : organizations) {
            organizationService.delete(org.getId());
            deletedOrgs++;
        }

        java.util.List<Organization> remainingCreatedOrganizations = organizationRepository.findByCreatedById(currentUserId).stream()
            .filter(org -> org.getId() != null && organizations.stream().noneMatch(deleted -> deleted.getId().equals(org.getId())))
            .peek(org -> org.setCreatedBy(null))
            .toList();
        if (!remainingCreatedOrganizations.isEmpty()) {
            organizationRepository.saveAll(remainingCreatedOrganizations);
        }

        java.util.List<Organization> remainingOrganizations = organizationRepository.findByUsersId(currentUserId);
        for (Organization organization : remainingOrganizations) {
            java.util.List<User> users = organization.getUsers() == null ? new ArrayList<>() : new ArrayList<>(organization.getUsers());
            boolean removed = users.removeIf(existingUser -> existingUser != null && existingUser.getId() != null && existingUser.getId().equals(currentUserId));
            if (removed) {
                organization.setUsers(users);
            }
        }
        if (!remainingOrganizations.isEmpty()) {
            organizationRepository.saveAll(remainingOrganizations);
        }

        organizationMemberRepository.deleteByUserId(currentUserId);
        inviteRepository.deleteAllByUserId(currentUserId);
        refreshRepository.deleteAllByUserId(currentUserId);

        userRepository.delete(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("deletedUserId", currentUserId);
        resp.put("organizationsDeleted", deletedOrgs);
        return resp;
    }
}
