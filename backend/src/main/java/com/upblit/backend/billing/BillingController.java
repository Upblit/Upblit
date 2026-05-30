package com.upblit.backend.billing;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runBilling() {
        try {
            billingService.generateInvoicesForAllUsers();
            return ResponseEntity.ok("Billing run started");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Billing run failed: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> userInvoices(@org.springframework.web.bind.annotation.PathVariable Long userId) {
        try {
            Long current = com.upblit.backend.security.UserdataUtil.getCurrentUserId();
            if (!current.equals(userId)) {
                return ResponseEntity.status(403).body("Forbidden");
            }
            return ResponseEntity.ok(billingService.getInvoicesForUser(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch invoices: " + e.getMessage());
        }
    }
}
