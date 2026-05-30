package com.upblit.backend.patreon;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.upblit.backend.core.Plan;
import com.upblit.backend.core.User;
import com.upblit.backend.core.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PatreonMembershipSyncService {
    private static final Logger log = LoggerFactory.getLogger(PatreonMembershipSyncService.class);
    private static final String STATE_ID = "default";

    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final PatreonIntegrationStateRepository stateRepository;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.patreon.enabled:false}")
    private boolean enabled;

    @Value("${app.patreon.client-id:}")
    private String clientId;

    @Value("${app.patreon.client-secret:}")
    private String clientSecret;

    @Value("${app.patreon.creator-access-token:}")
    private String creatorAccessToken;

    @Value("${app.patreon.creator-refresh-token:}")
    private String creatorRefreshToken;

    @Value("${app.patreon.creator-token-expires-at:}")
    private String creatorTokenExpiresAt;

    @Value("${app.patreon.campaign-id:}")
    private String campaignId;

    @Value("${app.patreon.supernova-tier-title:Supernova}")
    private String supernovaTierTitle;

    @Value("${app.patreon.supernova-tier-amount-cents:2000}")
    private int supernovaTierAmountCents;

    @Value("${app.patreon.user-agent:Upblit Patreon Sync}")
    private String userAgent;

    @Value("${app.patreon.callback-url:https://api.upblit.dev/auth/patreon/callback}")
    private String callbackUrl;

    @Value("${app.patreon.sync-delay-ms:3600000}")
    private long syncDelayMs;

    @PostConstruct
    public void bootstrap() {
        if (!enabled) {
            return;
        }

        PatreonIntegrationState state = stateRepository.findById(STATE_ID).orElseGet(() -> {
            PatreonIntegrationState created = new PatreonIntegrationState();
            created.setId(STATE_ID);
            created.setCampaignId(campaignId);
            created.setAccessToken(creatorAccessToken);
            created.setRefreshToken(creatorRefreshToken);
            created.setAccessTokenExpiresAt(parseInstantOrNull(creatorTokenExpiresAt));
            return created;
        });

        if (state.getCampaignId() == null || state.getCampaignId().isBlank()) {
            state.setCampaignId(campaignId);
        }

        if ((state.getAccessToken() == null || state.getAccessToken().isBlank()) && creatorAccessToken != null && !creatorAccessToken.isBlank()) {
            state.setAccessToken(creatorAccessToken);
        }

        if ((state.getRefreshToken() == null || state.getRefreshToken().isBlank()) && creatorRefreshToken != null && !creatorRefreshToken.isBlank()) {
            state.setRefreshToken(creatorRefreshToken);
        }

        if (state.getAccessTokenExpiresAt() == null) {
            state.setAccessTokenExpiresAt(parseInstantOrNull(creatorTokenExpiresAt));
        }

        stateRepository.save(state);

        try {
            syncMemberships();
        } catch (Exception exception) {
            log.warn("Initial Patreon membership sync failed", exception);
        }
    }

    @Scheduled(fixedDelayString = "${app.patreon.sync-delay-ms:3600000}")
    public void syncOnSchedule() {
        if (!enabled) {
            return;
        }

        try {
            syncMemberships();
        } catch (Exception exception) {
            log.warn("Patreon membership sync failed", exception);
        }
    }

    @Transactional
    public SyncResult syncMemberships() throws IOException, InterruptedException {
        PatreonIntegrationState state = stateRepository.findById(STATE_ID)
                .orElseThrow(() -> new IllegalStateException("Patreon integration state is not initialized"));

        String accessToken = ensureAccessToken(state);
        if (accessToken == null || accessToken.isBlank()) {
            return new SyncResult(0, 0, 0);
        }

        String campaign = state.getCampaignId() == null || state.getCampaignId().isBlank() ? campaignId : state.getCampaignId();
        if (campaign == null || campaign.isBlank()) {
            return new SyncResult(0, 0, 0);
        }

        Set<String> activePatreonUserIds = new HashSet<>();
        Set<String> activeEmails = new HashSet<>();
        Map<String, PatreonMemberSnapshot> snapshotsByUserId = new HashMap<>();

        String cursor = null;
        int memberCount = 0;
        do {
            JsonNode response = fetchMembersPage(accessToken, campaign, cursor);
            JsonNode data = response.path("data");
            JsonNode included = response.path("included");

            Map<String, TierSnapshot> tiers = parseTiers(included);
            Map<String, String> includedUserEmails = parseIncludedUsers(included);

            if (data.isArray()) {
                for (JsonNode memberNode : data) {
                    memberCount += 1;
                    PatreonMemberSnapshot snapshot = toSnapshot(memberNode, includedUserEmails, tiers);
                    if (snapshot == null) {
                        continue;
                    }

                    snapshotsByUserId.put(snapshot.userId(), snapshot);
                    if (snapshot.activeSupernova()) {
                        if (snapshot.userId() != null && !snapshot.userId().isBlank()) {
                            activePatreonUserIds.add(snapshot.userId());
                        }
                        if (snapshot.email() != null && !snapshot.email().isBlank()) {
                            activeEmails.add(snapshot.email());
                        }
                        upsertActiveUser(snapshot);
                    }
                }
            }

            cursor = response.path("meta").path("pagination").path("cursors").path("next").asText(null);
            if (cursor != null && cursor.isBlank()) {
                cursor = null;
            }
        } while (cursor != null);

        int demoted = demoteInactiveUsers(activePatreonUserIds, activeEmails);

        state.setLastSyncedAt(Instant.now());
        stateRepository.save(state);

        return new SyncResult(memberCount, snapshotsByUserId.values().stream().filter(PatreonMemberSnapshot::activeSupernova).toList().size(), demoted);
    }

    private int demoteInactiveUsers(Set<String> activePatreonUserIds, Set<String> activeEmails) {
        int demoted = 0;
        List<User> linkedUsers = userRepository.findByPatreonLinkedTrue();

        for (User user : linkedUsers) {
            if (user.getPlan() == null || user.getPlan().isBlank()) {
                continue;
            }

            if (Plan.WARLORD.name().equalsIgnoreCase(user.getPlan())) {
                continue;
            }

            boolean stillActive = matchesActivePatreonIdentity(user, activePatreonUserIds, activeEmails);
            if (!stillActive && Plan.SUPERNOVA.name().equalsIgnoreCase(user.getPlan())) {
                user.setPlan(Plan.PIRATES.name());
                user.setPatreonMembershipStatus("former_patron");
                user.setPatreonLastSyncedAt(Instant.now());
                userRepository.save(user);
                demoted += 1;
            }
        }

        return demoted;
    }

    private boolean matchesActivePatreonIdentity(User user, Set<String> activePatreonUserIds, Set<String> activeEmails) {
        if (user.getPatreonUserId() != null && activePatreonUserIds.contains(user.getPatreonUserId())) {
            return true;
        }

        if (user.getPatreonEmail() != null && activeEmails.contains(normalize(user.getPatreonEmail()))) {
            return true;
        }

        return user.getEmail() != null && activeEmails.contains(normalize(user.getEmail()));
    }

    private void upsertActiveUser(PatreonMemberSnapshot snapshot) {
        User user = null;
        if (snapshot.userId() != null && !snapshot.userId().isBlank()) {
            user = userRepository.findByPatreonUserId(snapshot.userId()).orElse(null);
        }

        if (user == null && snapshot.email() != null && !snapshot.email().isBlank()) {
            user = userRepository.findByPatreonEmail(normalize(snapshot.email())).orElse(null);
        }

        if (user == null && snapshot.email() != null && !snapshot.email().isBlank()) {
            user = userRepository.findByEmail(normalize(snapshot.email())).orElse(null);
        }

        if (user == null) {
            return;
        }

        if (user.getPlan() == null || !Plan.WARLORD.name().equalsIgnoreCase(user.getPlan())) {
            user.setPlan(Plan.SUPERNOVA.name());
        }

        user.setPatreonLinked(true);
        user.setPatreonUserId(snapshot.userId());
        user.setPatreonEmail(snapshot.email() == null ? null : normalize(snapshot.email()));
        user.setPatreonMembershipStatus(snapshot.patronStatus());
        user.setPatreonLastSyncedAt(Instant.now());
        userRepository.save(user);
    }

    private PatreonMemberSnapshot toSnapshot(JsonNode memberNode, Map<String, String> includedUserEmails, Map<String, TierSnapshot> tiers) {
        JsonNode attributes = memberNode.path("attributes");
        JsonNode relationships = memberNode.path("relationships");

        String patronStatus = attributes.path("patron_status").asText(null);
        int entitledAmount = attributes.path("currently_entitled_amount_cents").asInt(0);
        String memberEmail = attributes.path("email").asText(null);
        String userId = relationships.path("user").path("data").path("id").asText(null);

        if (memberEmail == null && userId != null) {
            memberEmail = includedUserEmails.get(userId);
        }

        boolean activeSupernova = isActiveSupernova(memberNode, tiers, patronStatus, entitledAmount);
        if (!activeSupernova && patronStatus == null && entitledAmount <= 0) {
            return new PatreonMemberSnapshot(userId, normalize(memberEmail), patronStatus, false);
        }

        return new PatreonMemberSnapshot(userId, normalize(memberEmail), patronStatus, activeSupernova);
    }

    private boolean isActiveSupernova(JsonNode memberNode, Map<String, TierSnapshot> tiers, String patronStatus, int entitledAmount) {
        if (!"active_patron".equalsIgnoreCase(patronStatus) && !"free_trial".equalsIgnoreCase(patronStatus)) {
            return false;
        }

        if (entitledAmount < supernovaTierAmountCents) {
            JsonNode tierRefs = memberNode.path("relationships").path("currently_entitled_tiers").path("data");
            if (tierRefs.isArray()) {
                for (JsonNode tierRef : tierRefs) {
                    String tierId = tierRef.path("id").asText(null);
                    TierSnapshot tier = tierId == null ? null : tiers.get(tierId);
                    if (tier == null) {
                        continue;
                    }

                    if (tier.amountCents() >= supernovaTierAmountCents) {
                        return true;
                    }

                    if (tier.title() != null && tier.title().equalsIgnoreCase(supernovaTierTitle)) {
                        return true;
                    }
                }
            }
            return false;
        }

        return true;
    }

    private Map<String, TierSnapshot> parseTiers(JsonNode included) {
        Map<String, TierSnapshot> tiers = new HashMap<>();
        if (!included.isArray()) {
            return tiers;
        }

        for (JsonNode item : included) {
            if (!"tier".equalsIgnoreCase(item.path("type").asText())) {
                continue;
            }

            String id = item.path("id").asText(null);
            if (id == null || id.isBlank()) {
                continue;
            }

            String title = item.path("attributes").path("title").asText(null);
            int amountCents = item.path("attributes").path("amount_cents").asInt(0);
            tiers.put(id, new TierSnapshot(title, amountCents));
        }

        return tiers;
    }

    private Map<String, String> parseIncludedUsers(JsonNode included) {
        Map<String, String> users = new HashMap<>();
        if (!included.isArray()) {
            return users;
        }

        for (JsonNode item : included) {
            if (!"user".equalsIgnoreCase(item.path("type").asText())) {
                continue;
            }

            String id = item.path("id").asText(null);
            String email = item.path("attributes").path("email").asText(null);
            if (id != null && !id.isBlank() && email != null && !email.isBlank()) {
                users.put(id, normalize(email));
            }
        }

        return users;
    }

    private JsonNode fetchMembersPage(String accessToken, String campaign, String cursor) throws IOException, InterruptedException {
        StringBuilder url = new StringBuilder("https://www.patreon.com/api/oauth2/v2/campaigns/")
                .append(campaign)
                .append("/members?page%5Bcount%5D=1000")
                .append("&include=currently_entitled_tiers,user")
                .append("&fields%5Bmember%5D=full_name,patron_status,email,currently_entitled_amount_cents")
                .append("&fields%5Buser%5D=full_name,email")
                .append("&fields%5Btier%5D=amount_cents,title");

        if (cursor != null && !cursor.isBlank()) {
            url.append("&page%5Bcursor%5D=").append(URLEncoder.encode(cursor, StandardCharsets.UTF_8));
        }

        HttpRequest request = HttpRequest.newBuilder(URI.create(url.toString()))
                .header("Authorization", "Bearer " + accessToken)
                .header("User-Agent", userAgent)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() >= 400) {
            throw new IOException("Patreon members API returned HTTP " + response.statusCode() + ": " + response.body());
        }

        return objectMapper.readTree(response.body());
    }

    private String ensureAccessToken(PatreonIntegrationState state) throws IOException, InterruptedException {
        if (state.getAccessToken() == null || state.getAccessToken().isBlank()) {
            return null;
        }

        if (state.getAccessTokenExpiresAt() == null || Instant.now().isBefore(state.getAccessTokenExpiresAt().minus(2, ChronoUnit.MINUTES))) {
            return state.getAccessToken();
        }

        if (clientId == null || clientId.isBlank() || clientSecret == null || clientSecret.isBlank() || state.getRefreshToken() == null || state.getRefreshToken().isBlank()) {
            return state.getAccessToken();
        }

        HttpRequest request = HttpRequest.newBuilder(URI.create("https://www.patreon.com/api/oauth2/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("User-Agent", userAgent)
                .POST(HttpRequest.BodyPublishers.ofString(
                        "grant_type=refresh_token"
                                + "&refresh_token=" + URLEncoder.encode(state.getRefreshToken(), StandardCharsets.UTF_8)
                                + "&client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8)
                                + "&client_secret=" + URLEncoder.encode(clientSecret, StandardCharsets.UTF_8)
                ))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() >= 400) {
            log.warn("Failed to refresh Patreon access token: {}", response.body());
            return state.getAccessToken();
        }

        JsonNode json = objectMapper.readTree(response.body());
        String refreshedAccessToken = json.path("access_token").asText(null);
        String refreshedRefreshToken = json.path("refresh_token").asText(null);
        long expiresIn = json.path("expires_in").asLong(3600);

        if (refreshedAccessToken != null && !refreshedAccessToken.isBlank()) {
            state.setAccessToken(refreshedAccessToken);
        }
        if (refreshedRefreshToken != null && !refreshedRefreshToken.isBlank()) {
            state.setRefreshToken(refreshedRefreshToken);
        }
        state.setAccessTokenExpiresAt(Instant.now().plusSeconds(expiresIn));
        stateRepository.save(state);

        return state.getAccessToken();
    }

    @Transactional
    public void exchangeAuthorizationCode(String authorizationCode) throws IOException, InterruptedException {
        if (authorizationCode == null || authorizationCode.isBlank()) {
            throw new IllegalArgumentException("Patreon authorization code is required");
        }

        if (clientId == null || clientId.isBlank() || clientSecret == null || clientSecret.isBlank()) {
            throw new IllegalStateException("Patreon client credentials are not configured");
        }

        PatreonIntegrationState state = stateRepository.findById(STATE_ID).orElseGet(() -> {
            PatreonIntegrationState created = new PatreonIntegrationState();
            created.setId(STATE_ID);
            return created;
        });

        HttpRequest request = HttpRequest.newBuilder(URI.create("https://www.patreon.com/api/oauth2/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("User-Agent", userAgent)
                .POST(HttpRequest.BodyPublishers.ofString(
                        "grant_type=authorization_code"
                                + "&code=" + URLEncoder.encode(authorizationCode, StandardCharsets.UTF_8)
                                + "&client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8)
                                + "&client_secret=" + URLEncoder.encode(clientSecret, StandardCharsets.UTF_8)
                                + "&redirect_uri=" + URLEncoder.encode(callbackUrl, StandardCharsets.UTF_8)
                ))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() >= 400) {
            throw new IOException("Failed to exchange Patreon authorization code: " + response.body());
        }

        JsonNode json = objectMapper.readTree(response.body());
        String accessToken = json.path("access_token").asText(null);
        String refreshToken = json.path("refresh_token").asText(null);
        long expiresIn = json.path("expires_in").asLong(3600);

        if (accessToken == null || accessToken.isBlank()) {
            throw new IOException("Patreon did not return an access token");
        }

        state.setAccessToken(accessToken);
        if (refreshToken != null && !refreshToken.isBlank()) {
            state.setRefreshToken(refreshToken);
        }
        state.setAccessTokenExpiresAt(Instant.now().plusSeconds(expiresIn));
        stateRepository.save(state);
    }

    private Instant parseInstantOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return Instant.parse(value);
        } catch (Exception exception) {
            return null;
        }
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    public record SyncResult(int membersChecked, int activeSupernovaMembers, int demotedUsers) {}

    private record TierSnapshot(String title, int amountCents) {}

    private record PatreonMemberSnapshot(String userId, String email, String patronStatus, boolean activeSupernova) {}
}