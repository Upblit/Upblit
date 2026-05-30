package com.upblit.backend.core.org;

import com.upblit.backend.core.Organization;
import com.upblit.backend.core.OrganizationRepository;
import com.upblit.backend.security.UserdataUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InviteService {

    @Autowired
    private InviteRepository inviteRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationService organizationService;
    
    @Autowired
    private OrganizationMemberRepository memberRepository;

    public Invite createInvite(Long organizationId) {
        return createInvite(organizationId, null);
    }

    public Invite createInvite(Long organizationId, String email) {
        // Only Owner or Admin can create invites
        Long currentUserId = UserdataUtil.getCurrentUserId();
        var member = memberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId).orElse(null);
        if (member == null) {
            return null;
        }
        if (member.getRole() != OrganizationRole.OWNER && member.getRole() != OrganizationRole.ADMIN) {
            return null;
        }

        Invite invite = new Invite();
        invite.setOrganizationId(organizationId);
        invite.setEmail(email);
        invite.setPublicToken(UUID.randomUUID().toString());
        invite.setCreatedById(currentUserId);
        invite.setCreatedAt(Instant.now());
        invite.setExpiresAt(Instant.now().plusSeconds(7L * 24 * 60 * 60));
        invite.setActive(true);
        return inviteRepository.save(invite);
    }

    public String createPublicLink(Long organizationId) {
        Invite invite = createInvite(organizationId);
        if (invite == null) {
            return null;
        }

        return "/invite/public/" + invite.getPublicToken();
    }

    public Invite getInviteById(UUID id) {
        Optional<Invite> invite = inviteRepository.findById(id);
        if (invite.isEmpty()) {
            return null;
        }

        return isOrganizationAccessibleByCurrentUser(invite.get().getOrganizationId()) ? invite.get() : null;
    }

    public Invite getInviteByUserId(Long userId) {
        return inviteRepository.findByUserId(userId)
                .filter(invite -> isOrganizationAccessibleByCurrentUser(invite.getOrganizationId()))
                .orElse(null);
    }

    public List<Invite> getInvitesByOrganization(Long organizationId) {
        if (!isOrganizationAccessibleByCurrentUser(organizationId)) {
            return List.of();
        }

        return inviteRepository.findAllByOrganizationId(organizationId);
    }

    public List<Invite> getInvitesByOrganizationAndActive(Long organizationId, boolean active) {
        if (!isOrganizationAccessibleByCurrentUser(organizationId)) {
            return List.of();
        }

        return inviteRepository.findAllByOrganizationIdAndActive(organizationId, active);
    }

    public Invite deactivateInvite(UUID id) {
        Optional<Invite> optionalInvite = inviteRepository.findById(id);
        if (optionalInvite.isEmpty()) {
            return null;
        }

        Invite invite = optionalInvite.get();
        if (!isOrganizationAccessibleByCurrentUser(invite.getOrganizationId())) {
            return null;
        }

        invite.setActive(false);
        return inviteRepository.save(invite);
    }

    public Invite activateInvite(UUID id) {
        Optional<Invite> optionalInvite = inviteRepository.findById(id);
        if (optionalInvite.isEmpty()) {
            return null;
        }

        Invite invite = optionalInvite.get();
        if (!isOrganizationAccessibleByCurrentUser(invite.getOrganizationId())) {
            return null;
        }

        invite.setActive(true);
        return inviteRepository.save(invite);
    }

    public boolean deleteInvite(UUID id) {
        Optional<Invite> optionalInvite = inviteRepository.findById(id);
        if (optionalInvite.isEmpty()) {
            return false;
        }

        Invite invite = optionalInvite.get();
        if (!isOrganizationAccessibleByCurrentUser(invite.getOrganizationId())) {
            return false;
        }

        inviteRepository.delete(invite);
        return true;
    }

    @Transactional
    public Organization acceptInvite(UUID id) {
        Optional<Invite> optionalInvite = inviteRepository.findById(id);
        if (optionalInvite.isEmpty()) {
            return null;
        }

        Invite invite = optionalInvite.get();
        if (!invite.isActive()) {
            return null;
        }

        if (invite.getExpiresAt() != null && invite.getExpiresAt().isBefore(Instant.now())) {
            return null;
        }

        Long currentUserId = UserdataUtil.getCurrentUserId();
        if (invite.getUserId() != null && !invite.getUserId().equals(currentUserId)) {
            return null;
        }

        Organization organization = organizationService.addUserToOrganization(invite.getOrganizationId(), currentUserId);
        if (organization == null) {
            return null;
        }

        invite.setActive(false);
        invite.setUserId(currentUserId);
        inviteRepository.save(invite);

        return organization;
    }

    @Transactional
    public Organization acceptInviteByToken(String publicToken) {
        Optional<Invite> optionalInvite = inviteRepository.findByPublicToken(publicToken);
        if (optionalInvite.isEmpty()) {
            return null;
        }

        Invite invite = optionalInvite.get();
        if (!invite.isActive()) {
            return null;
        }

        if (invite.getExpiresAt() != null && invite.getExpiresAt().isBefore(Instant.now())) {
            return null;
        }

        Long currentUserId = UserdataUtil.getCurrentUserId();
        if (invite.getUserId() != null && !invite.getUserId().equals(currentUserId)) {
            return null;
        }

        Organization organization = organizationService.addUserToOrganization(invite.getOrganizationId(), currentUserId);
        if (organization == null) {
            return null;
        }

        invite.setActive(false);
        invite.setUserId(currentUserId);
        inviteRepository.save(invite);

        return organization;
    }

    private boolean isOrganizationAccessibleByCurrentUser(Long organizationId) {
        return organizationRepository.findByIdAndUsersId(organizationId, UserdataUtil.getCurrentUserId()).isPresent();
    }

    public Organization getAccessibleOrganization(Long organizationId) {
        return organizationRepository.findByIdAndUsersId(organizationId, UserdataUtil.getCurrentUserId()).orElse(null);
    }
}