package com.upblit.backend.auth;

import com.upblit.backend.core.Plan;
import com.upblit.backend.core.User;
import com.upblit.backend.core.UserRepository;
import com.upblit.backend.billing.BillingService;
import com.upblit.backend.billing.Invoice;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/warlord")
public class WarlordController {

    @Value("${WARLORD_UPGRADE_PASSWORD:}")
    private String warlordPassword;

    private final UserRepository userRepository;
    private final BillingService billingService;

    public WarlordController(UserRepository userRepository, BillingService billingService) {
        this.userRepository = userRepository;
        this.billingService = billingService;
    }

    @PostMapping("/upgrade")
    public ResponseEntity<?> upgradeToWarlord(@RequestBody WarlordUpgradeRequest req) {
        try {
            if (warlordPassword == null || warlordPassword.isBlank()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Warlord upgrade password not configured");
            }

            if (req.getPassword() == null || !warlordPassword.equals(req.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            }

            String email = req.getEmail() == null ? null : req.getEmail().trim().toLowerCase();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required");
            }

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            // generate prorated invoice for the period since last bill until now
            try {
                Invoice inv = billingService.generateProratedInvoiceOnPlanChange(user, user.getPlan(), Plan.WARLORD.name(), java.time.Instant.now(), req.getAmount());
            } catch (Exception ex) {
                // log and continue
                ex.printStackTrace();
            }

            // set the user's warlord amount and plan
            if (req.getAmount() != null) {
                user.setWarlordAmount(req.getAmount());
            }
            user.setPlan(Plan.WARLORD.name());
            userRepository.save(user);

            Map<String, Object> resp = new HashMap<>();
            resp.put("id", user.getId());
            resp.put("email", user.getEmail());
            resp.put("plan", user.getPlan());
            resp.put("amount", req.getAmount());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upgrade user to warlord");
        }
    }
}
