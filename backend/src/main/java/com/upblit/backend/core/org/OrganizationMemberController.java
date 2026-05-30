package com.upblit.backend.core.org;

import com.upblit.backend.core.User;
import com.upblit.backend.core.UserRepository;
import com.upblit.backend.security.UserdataUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/org")
public class OrganizationMemberController {
    @Autowired
    private OrganizationMemberRepository memberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationService organizationService;

    @PutMapping("/{orgId}/member/{userId}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long orgId, @PathVariable Long userId, @RequestParam("role") OrganizationRole role) {
        if (role == OrganizationRole.OWNER) {
            return organizationService.transferOwnership(orgId, userId);
        }

        Long currentUserId = UserdataUtil.getCurrentUserId();
        OrganizationMember requester = memberRepository.findByOrganizationIdAndUserId(orgId, currentUserId).orElse(null);
        if (requester == null || requester.getRole() != OrganizationRole.OWNER) {
            return ResponseEntity.status(403).body("Forbidden: only owner can change roles");
        }

        OrganizationMember target = memberRepository.findByOrganizationIdAndUserId(orgId, userId).orElse(null);
        if (target == null) {
            return ResponseEntity.notFound().build();
        }

        // Prevent owner from demoting themselves
        if (userId.equals(currentUserId) && target.getRole() == OrganizationRole.OWNER && role != OrganizationRole.OWNER) {
            return ResponseEntity.status(403).body("Forbidden: owner cannot demote themselves");
        }

        target.setRole(role);
        memberRepository.save(target);
        return ResponseEntity.ok().body(target);
    }

    @GetMapping("/{orgId}/members")
    public ResponseEntity<?> getMembers(@PathVariable Long orgId) {
        Long currentUserId = UserdataUtil.getCurrentUserId();
        OrganizationMember requester = memberRepository.findByOrganizationIdAndUserId(orgId, currentUserId).orElse(null);
        var members = memberRepository.findByOrganizationId(orgId);

        boolean revealEmails = false;
        if (requester != null && (requester.getRole() == OrganizationRole.OWNER || requester.getRole() == OrganizationRole.ADMIN)) {
            revealEmails = true;
        }

        // build safe DTOs
        var list = new java.util.ArrayList<OrganizationMemberDTO>();
        for (OrganizationMember m : members) {
            var u = m.getUser();
            UserSummary us = new UserSummary();
            us.setId(u.getId());
            us.setUsername(u.getUsername());
            us.setAvatarUrl(u.getAvatarUrl());
            if (revealEmails) us.setEmail(u.getEmail());

            OrganizationMemberDTO dto = new OrganizationMemberDTO();
            dto.setId(m.getId());
            dto.setRole(m.getRole());
            dto.setUser(us);
            list.add(dto);
        }

        return ResponseEntity.ok().body(list);
    }

    @DeleteMapping("/{orgId}/member/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long orgId, @PathVariable Long userId) {
        Long currentUserId = UserdataUtil.getCurrentUserId();
        OrganizationMember requester = memberRepository.findByOrganizationIdAndUserId(orgId, currentUserId).orElse(null);
        if (requester == null) {
            return ResponseEntity.status(403).body("Forbidden: not a member");
        }

        OrganizationMember target = memberRepository.findByOrganizationIdAndUserId(orgId, userId).orElse(null);
        if (target == null) {
            return ResponseEntity.notFound().build();
        }

        // Self removal allowed
        if (userId.equals(currentUserId)) {
            memberRepository.deleteByOrganizationIdAndUserId(orgId, userId);
            return ResponseEntity.ok().build();
        }

        // Only OWNER or ADMIN can remove other members
        if (requester.getRole() != OrganizationRole.OWNER && requester.getRole() != OrganizationRole.ADMIN) {
            return ResponseEntity.status(403).body("Forbidden: insufficient permissions to remove member");
        }

        // Prevent ADMIN from removing OWNER
        if (target.getRole() == OrganizationRole.OWNER && requester.getRole() != OrganizationRole.OWNER) {
            return ResponseEntity.status(403).body("Forbidden: cannot remove owner");
        }

        memberRepository.deleteByOrganizationIdAndUserId(orgId, userId);
        return ResponseEntity.ok().build();
    }
}
