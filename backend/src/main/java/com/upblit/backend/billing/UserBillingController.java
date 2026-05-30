package com.upblit.backend.billing;

import com.upblit.backend.security.UserdataUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserBillingController {

    private final BillingService billingService;

    public UserBillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping("/user/billing/{userId}")
    public ResponseEntity<?> getUserBilling(@PathVariable Long userId) {
        try {
            Long current = UserdataUtil.getCurrentUserId();
            if (!current.equals(userId)) {
                return ResponseEntity.status(403).body("Forbidden");
            }
            return ResponseEntity.ok(billingService.getInvoicesForUser(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch invoices: " + e.getMessage());
        }
    }
}
