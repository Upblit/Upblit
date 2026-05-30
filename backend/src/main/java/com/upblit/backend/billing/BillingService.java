package com.upblit.backend.billing;

import com.upblit.backend.core.Plan;
import com.upblit.backend.core.User;
import com.upblit.backend.core.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BillingService {

    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;

    @Value("${supabase.uri}")
    private String supabaseUri;

    @Value("${supabase.api.key}")
    private String supabaseApiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public BillingService(UserRepository userRepository, InvoiceRepository invoiceRepository) {
        this.userRepository = userRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public void generateInvoicesForAllUsers() throws Exception {
        List<User> users = userRepository.findAll();
        Instant now = Instant.now();
        for (User u : users) {
            Instant last = u.getLastBilledAt();
            if (last == null) {
                // default to 30 days ago
                last = now.minus(30, ChronoUnit.DAYS);
            }

            if (last.plus(30, ChronoUnit.DAYS).isAfter(now)) continue; // not yet time

            Instant periodStart = last;
            Instant periodEnd = last.plus(30, ChronoUnit.DAYS);

            double amount = computeAmountForPeriod(u, u.getPlan(), periodStart, periodEnd);

            byte[] pdf = createInvoicePdf(u, periodStart, periodEnd, amount);
            String path = String.format("invoices/%d/%d.pdf", u.getId(), System.currentTimeMillis());
            String url = uploadToSupabase(path, pdf);

            Invoice inv = new Invoice();
            inv.setUserId(u.getId());
            inv.setPlan(u.getPlan());
            inv.setAmount(amount);
            inv.setPeriodStart(periodStart);
            inv.setPeriodEnd(periodEnd);
            inv.setCreatedAt(Instant.now());
            inv.setStorageUrl(url);
            invoiceRepository.save(inv);

            u.setLastBilledAt(periodEnd);
            userRepository.save(u);
        }
    }

    public Invoice generateProratedInvoiceOnPlanChange(User user, String oldPlan, String newPlan, Instant changeAt, Double warlordAmount) throws Exception {
        Instant last = user.getLastBilledAt();
        if (last == null) last = changeAt.minus(30, ChronoUnit.DAYS);

        // bill from last to changeAt
        double amount = computeAmountForPeriod(user, oldPlan, last, changeAt);

        byte[] pdf = createInvoicePdf(user, last, changeAt, amount);
        String path = String.format("invoices/%d/%d-prorated.pdf", user.getId(), System.currentTimeMillis());
        String url = uploadToSupabase(path, pdf);

        Invoice inv = new Invoice();
        inv.setUserId(user.getId());
        inv.setPlan(oldPlan);
        inv.setAmount(amount);
        inv.setPeriodStart(last);
        inv.setPeriodEnd(changeAt);
        inv.setCreatedAt(Instant.now());
        inv.setStorageUrl(url);
        invoiceRepository.save(inv);

        // reset billing interval from changeAt
        user.setLastBilledAt(changeAt);
        if (warlordAmount != null && warlordAmount > 0) {
            user.setWarlordAmount(warlordAmount);
        }
        userRepository.save(user);

        return inv;
    }

    public java.util.List<Invoice> getInvoicesForUser(Long userId) {
        return invoiceRepository.findByUserId(userId);
    }

    private double computeAmountForPeriod(User user, String plan, Instant start, Instant end) {
        long days = ChronoUnit.DAYS.between(start, end);
        double ratePer30 = 0.0;
        if (Plan.SUPERNOVA.name().equals(plan)) {
            ratePer30 = 3.0;
        } else if (Plan.WARLORD.name().equals(plan)) {
            // Use per-user warlord amount if set
            ratePer30 = user.getWarlordAmount() != null ? user.getWarlordAmount() : 0.0;
        } else {
            ratePer30 = 0.0;
        }

        double perDay = ratePer30 / 30.0;
        return Math.round(perDay * Math.max(0, days) * 100.0) / 100.0;
    }

    private double computeAmountForPeriod(String plan, Instant start, Instant end) {
        // fallback when user is not available (shouldn't happen for Warlord)
        long days = ChronoUnit.DAYS.between(start, end);
        double ratePer30 = Plan.SUPERNOVA.name().equals(plan) ? 3.0 : 0.0;
        double perDay = ratePer30 / 30.0;
        return Math.round(perDay * Math.max(0, days) * 100.0) / 100.0;
    }

    private byte[] createInvoicePdf(User user, Instant periodStart, Instant periodEnd, double amount) throws Exception {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 16);
                cs.newLineAtOffset(50, 700);
                cs.showText("Upblit Invoice");
                cs.endText();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 12);
                cs.newLineAtOffset(50, 660);
                cs.showText("User: " + (user.getUsername() != null ? user.getUsername() : user.getEmail()));
                cs.endText();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 12);
                cs.newLineAtOffset(50, 640);
                cs.showText("Period: " + periodStart.toString() + " - " + periodEnd.toString());
                cs.endText();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 14);
                cs.newLineAtOffset(50, 600);
                cs.showText(String.format("Amount: $%.2f", amount));
                cs.endText();
            }

            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                doc.save(baos);
                return baos.toByteArray();
            }
        }
    }

    private String uploadToSupabase(String path, byte[] data) throws Exception {
        // PUT /storage/v1/object/{bucket}/{path}
        String bucket = "invoices";
        String url = supabaseUri + "/storage/v1/object/" + bucket + "/" + path;

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("apikey", supabaseApiKey)
                .header("Authorization", "Bearer " + supabaseApiKey)
                .header("content-type", "application/pdf")
                .PUT(HttpRequest.BodyPublishers.ofByteArray(data))
                .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
            // build public URL
            return String.format("%s/storage/v1/object/public/%s/%s", supabaseUri, bucket, path);
        }

        throw new RuntimeException("Failed to upload invoice to supabase: " + resp.statusCode() + " " + resp.body());
    }
}
