package com.upblit.backend.billing;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BillingScheduler {

    private final BillingService billingService;

    public BillingScheduler(BillingService billingService) {
        this.billingService = billingService;
    }

    // Run daily at 01:00 UTC
    @Scheduled(cron = "0 0 1 * * *")
    public void dailyInvoiceRun() {
        try {
            billingService.generateInvoicesForAllUsers();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
