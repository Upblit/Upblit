package com.upblit.backend.core.org;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.upblit.backend.core.Organization;
import com.upblit.backend.email.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/invite")
public class InviteController {

    @Autowired
    private InviteService inviteService;

    @Autowired
    private EmailService emailService;

    @Value("${frontend.uri}")
    private String frontendUri;

    @PostMapping
    public ResponseEntity<?> createInvite(@RequestBody String payload) {
        if (payload == null || payload.isBlank()) {
            return ResponseEntity.badRequest().body("OrganizationId is required");
        }

        Long organizationId;
        String email = null;
        String recipientName = null;

        try {
            JsonNode payloadNode = new ObjectMapper().readTree(payload);

            if (payloadNode.isNumber()) {
                organizationId = payloadNode.longValue();
            } else {
                JsonNode organizationIdNode = payloadNode.get("organizationId");
                if (organizationIdNode == null || !organizationIdNode.canConvertToLong()) {
                    return ResponseEntity.badRequest().body("OrganizationId is required");
                }
                organizationId = organizationIdNode.longValue();

                JsonNode emailNode = payloadNode.get("email");
                if (emailNode != null && !emailNode.isNull()) {
                    email = emailNode.asText();
                }

                JsonNode nameNode = payloadNode.get("name");
                if (nameNode != null && !nameNode.isNull()) {
                    recipientName = nameNode.asText();
                }
            }
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Invalid invite payload");
        }

        Invite savedInvite = inviteService.createInvite(organizationId, email);
        if (savedInvite == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        if (email != null && !email.isBlank()) {
            Organization organization = inviteService.getAccessibleOrganization(organizationId);
            String inviteBase = frontendUri == null ? "" : frontendUri.replaceAll("/+$", "");
            String inviteLink = inviteBase + "/invite/public/" + savedInvite.getPublicToken();

            try {
                emailService.sendInviteEmail(
                        email.trim(),
                        recipientName,
                        inviteLink,
                        organization != null ? organization.getName() : "Upblit"
                );
            } catch (Exception ex) {
                inviteService.deleteInvite(savedInvite.getId());
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body("Invite was created but the email could not be sent");
            }
        }

        return new ResponseEntity<>(savedInvite, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInviteById(@PathVariable UUID id) {
        Invite invite = inviteService.getInviteById(id);

        if (invite == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invite not found");
        }

        return new ResponseEntity<>(invite, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getInviteByUserId(@PathVariable Long userId) {
        Invite invite = inviteService.getInviteByUserId(userId);

        if (invite == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invite not found");
        }

        return ResponseEntity.ok(invite);
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<Invite>> getInvitesByOrganization(@PathVariable Long organizationId) {
        List<Invite> invites = inviteService.getInvitesByOrganization(organizationId);
        return ResponseEntity.ok(invites);
    }

    @GetMapping("/organization/{organizationId}/active")
    public ResponseEntity<List<Invite>> getInvitesByOrganizationAndActive(
            @PathVariable Long organizationId,
            @RequestParam boolean active
    ) {
        List<Invite> invites = inviteService.getInvitesByOrganizationAndActive(organizationId, active);
        return ResponseEntity.ok(invites);
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateInvite(@PathVariable UUID id) {
        Invite invite = inviteService.deactivateInvite(id);

        if (invite == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invite not found");
        }

        return ResponseEntity.ok(invite);
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateInvite(@PathVariable UUID id) {
        Invite invite = inviteService.activateInvite(id);

        if (invite == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invite not found");
        }

        return ResponseEntity.ok(invite);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInvite(@PathVariable UUID id) {
        boolean deleted = inviteService.deleteInvite(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invite not found");
        }

        return ResponseEntity.ok("Invite deleted successfully");
    }

    @PostMapping("/public-link")
    public ResponseEntity<String> createPublicLink(@RequestBody Long organizationId) {
        String publicLink = inviteService.createPublicLink(organizationId);

        if (publicLink == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invite not found");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(publicLink);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptInvite(@PathVariable UUID id) {
        Organization organization = inviteService.acceptInvite(id);

        if (organization == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invite is invalid, expired, inactive, or not meant for this user");
        }

        return ResponseEntity.ok(organization);
    }

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