package com.upblit.backend.security.OAuth;

import com.upblit.backend.core.User;
import com.upblit.backend.core.UserRepository;
import com.upblit.backend.core.user.UserService;
import com.upblit.backend.security.JWT.JWTService;
import com.upblit.backend.security.RefreshToken.RefreshService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import jakarta.servlet.http.Cookie;

public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private static final String CLI_REDIRECT_COOKIE = "upblit_cli_redirect_uri";

    private final JWTService jwtService;
    private final RefreshService refreshService;
    private final UserRepository userRepository;
    @Value("${frontend.uri}")
    String frontendUrl;

    public OAuth2SuccessHandler(JWTService jwtService, RefreshService refreshService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.refreshService = refreshService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        User user = resolveUser(authentication);
        String refresh = refreshService.createRefreshToken(user.getId());
        String jwt = jwtService.generateToken(
                String.valueOf(user.getId()),
                user.getAvatarUrl(),
                user.getUsername(),
            user.getEmail(),
            user.getPlan()
        );

        String cliRedirect = readCliRedirectUri(request);
        if (cliRedirect != null) {
            clearCliRedirectCookie(response);
            response.sendRedirect(appendQueryParams(cliRedirect, Map.of("token", jwt, "refresh", refresh)));
            return;
        }

        response.sendRedirect(frontendUrl + "/oauth-success?token=" + jwt + "&refresh=" + refresh);
    }

    private String readCliRedirectUri(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        return Arrays.stream(cookies)
                .filter(cookie -> CLI_REDIRECT_COOKIE.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private void clearCliRedirectCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(CLI_REDIRECT_COOKIE, "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
    }

    private String appendQueryParams(String baseUrl, Map<String, String> params) {
        StringBuilder builder = new StringBuilder(baseUrl);
        builder.append(baseUrl.contains("?") ? "&" : "?");
        boolean first = true;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!first) {
                builder.append("&");
            }
            builder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
            builder.append("=");
            builder.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
            first = false;
        }
        return builder.toString();
    }

    private User resolveUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomOAuth2User customUser) {
            return customUser.getUser();
        }

        if (!(principal instanceof OAuth2User oauth2User)) {
            throw new IllegalStateException("Unsupported OAuth principal: " + principal.getClass().getName());
        }

        String registrationId = authentication instanceof OAuth2AuthenticationToken token
                ? token.getAuthorizedClientRegistrationId()
                : null;
        Map<String, Object> attributes = oauth2User.getAttributes();

        String providerId = getProviderId(registrationId, attributes);
        String email = getEmail(registrationId, attributes);
        String username = getUsername(registrationId, attributes);
        String avatarUrl = getAvatarUrl(registrationId, attributes);

        User existing = findExistingUser(registrationId, providerId, email);
        if (existing == null) {
            existing = new User();
            existing.setPlan("PIRATES");
        }

        if (registrationId != null) {
            existing.setAuthProvider(registrationId.toUpperCase());
        }
        if (username != null && !username.isBlank()) {
            existing.setUsername(username);
        }
        if (email != null && !email.isBlank()) {
            existing.setEmail(email);
        }
        if (avatarUrl != null && !avatarUrl.isBlank()) {
            existing.setAvatarUrl(avatarUrl);
        }

        existing.setEmailVerified(true);
        existing.setEmailVerificationToken(null);
        existing.setEmailVerificationTokenExpiresAt(null);
        existing.setLastLogin(Instant.now());

        if ("google".equalsIgnoreCase(registrationId)) {
            existing.setGoogleId(providerId);
        } else if ("github".equalsIgnoreCase(registrationId)) {
            existing.setGithubId(providerId);
        }

        return userRepository.save(existing);
    }

    private User findExistingUser(String registrationId, String providerId, String email) {
        if ("google".equalsIgnoreCase(registrationId) && providerId != null) {
            User byGoogle = userRepository.findByGoogleId(providerId).orElse(null);
            if (byGoogle != null) {
                return byGoogle;
            }
        }

        if ("github".equalsIgnoreCase(registrationId) && providerId != null) {
            User byGithub = userRepository.findByGithubId(providerId).orElse(null);
            if (byGithub != null) {
                return byGithub;
            }
        }

        if (email != null && !email.isBlank()) {
            return userRepository.findByEmail(email).orElse(null);
        }

        return null;
    }

    private String getProviderId(String registrationId, Map<String, Object> attributes) {
        Object value = "google".equalsIgnoreCase(registrationId) ? attributes.get("sub") : attributes.get("id");
        return value != null ? value.toString() : null;
    }

    private String getUsername(String registrationId, Map<String, Object> attributes) {
        Object value = "google".equalsIgnoreCase(registrationId) ? attributes.get("name") : attributes.get("login");
        return value != null ? value.toString() : null;
    }

    private String getEmail(String registrationId, Map<String, Object> attributes) {
        Object value = attributes.get("email");
        return value != null ? value.toString() : null;
    }

    private String getAvatarUrl(String registrationId, Map<String, Object> attributes) {
        Object value = "google".equalsIgnoreCase(registrationId) ? attributes.get("picture") : attributes.get("avatar_url");
        return value != null ? value.toString() : null;
    }
    public static String extractUsername(CustomOAuth2User user) {
        Object login = user.getAttributes().get("login");
        return login != null ? login.toString() : null;
    }

    public static String extractAvatarUrl(CustomOAuth2User user) {
        Object avatar = user.getAttributes().get("avatar_url");
        return avatar != null ? avatar.toString() : null;
    }

    public static String extractEmail(CustomOAuth2User user) {
        Object email = user.getAttributes().get("email");
        return email != null ? email.toString() : null;
    }
    private String extractGithubId(CustomOAuth2User customUser) {
        Object idObj = customUser.getAttributes().get("id");  // Use getAttributes() instead of getAttribute()
      if (idObj instanceof String) {
            return (String) idObj;
        } else {
            // Fallback to login if id is not available or in unexpected format
            Object login = customUser.getAttributes().get("login");
            return login != null ? login.toString() : "unknown";
        }
    }
}