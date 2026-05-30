package com.upblit.backend.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final String CLI_REDIRECT_COOKIE = "upblit_cli_redirect_uri";

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthLoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestParam String token) {
        return ResponseEntity.ok(authService.verifyEmail(token));
    }

    @GetMapping("/cli/start")
    public void startCliLogin(
            @RequestParam(defaultValue = "github") String provider,
            @RequestParam String redirectUri,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        validateRedirectUri(redirectUri);

        Cookie cookie = new Cookie(CLI_REDIRECT_COOKIE, redirectUri);
        cookie.setHttpOnly(true);
        cookie.setSecure(request.isSecure());
        cookie.setPath("/");
        cookie.setMaxAge(300);
        response.addCookie(cookie);
        response.sendRedirect("/oauth2/authorization/" + provider);
    }

    private void validateRedirectUri(String redirectUri) {
        try {
            URI uri = new URI(redirectUri);
            String host = uri.getHost();
            String scheme = uri.getScheme();
            if (!"http".equalsIgnoreCase(scheme) || host == null) {
                throw new IllegalArgumentException("redirectUri must be a local http URL");
            }
            if (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equals(host) && !"::1".equals(host)) {
                throw new IllegalArgumentException("redirectUri must point to localhost");
            }
        } catch (URISyntaxException ex) {
            throw new IllegalArgumentException("redirectUri is invalid", ex);
        }
    }
}