package com.upblit.backend.core.org;

import com.upblit.backend.core.Organization;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/invite")
public class InviteController {

    @Autowired
    private InviteService inviteService;

    // Create Invite
    @PostMapping
    public ResponseEntity<Invite> createInvite(@RequestBody Long OrganizationId) {
        Invite savedInvite = inviteService.createInvite(OrganizationId);
        if (savedInvite == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(savedInvite, HttpStatus.CREATED);

    }

    // Get Invite By ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getInviteById(@PathVariable UUID id) {

        Invite invite = inviteService.getInviteById(id);

        if (invite == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invite not found");
        }

        return new ResponseEntity<>(invite, HttpStatus.OK);

    }

    // Get Invite By User ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getInviteByUserId(@PathVariable Long userId) {

        Invite invite = inviteService.getInviteByUserId(userId);

        if (invite == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invite not found");
        }

        return ResponseEntity.ok(invite);
    }

    // Get All Invites For Organization
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<Invite>> getInvitesByOrganization(
            @PathVariable Long organizationId
    ) {

        List<Invite> invites = inviteService.getInvitesByOrganization(organizationId);

        return ResponseEntity.ok(invites);
    }

    // Get Active/Inactive Invites
    @GetMapping("/organization/{organizationId}/active")
    public ResponseEntity<List<Invite>> getInvitesByOrganizationAndActive(
            @PathVariable Long organizationId,
            @RequestParam boolean active
    ) {

        List<Invite> invites = inviteService.getInvitesByOrganizationAndActive(organizationId, active);

        return ResponseEntity.ok(invites);
    }

    // Deactivate Invite
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateInvite(@PathVariable UUID id) {

        Invite invite = inviteService.deactivateInvite(id);

        if (invite == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invite not found");
        }

        return ResponseEntity.ok(invite);
    }

    // Delete Invite
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInvite(@PathVariable UUID id) {

        boolean deleted = inviteService.deleteInvite(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invite not found");
        }

        return ResponseEntity.ok("Invite deleted successfully");
    }

    // Create a shareable public link for an organization invite
    @PostMapping("/public-link")
    public ResponseEntity<String> createPublicLink(@RequestBody Long organizationId) {
        String publicLink = inviteService.createPublicLink(organizationId);

        if (publicLink == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invite not found");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(publicLink);
    }

    // Join organization using invite
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptInvite(@PathVariable UUID id) {
        Organization organization = inviteService.acceptInvite(id);

        if (organization == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invite is invalid, expired, inactive, or not meant for this user");
        }

        return ResponseEntity.ok(organization);
    }

    // Join organization using public invite link token
    @PostMapping("/public/{token}/accept")
    public ResponseEntity<?> acceptInviteByToken(@PathVariable String token) {
        Organization organization = inviteService.acceptInviteByToken(token);

        if (organization == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invite is invalid, expired, inactive, or not meant for this user");
        }

        return ResponseEntity.ok(organization);
    }
}