package com.upblit.backend.config;

import com.upblit.backend.core.QuotaExceededException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(Map.of("message", "Logo file is too large. Please upload a file smaller than 10MB."));
    }

    /**
     * Returns a structured 403 when any plan quota is exceeded.
     * The frontend reads "error": "QUOTA_EXCEEDED" to show an upgrade prompt.
     */
    @ExceptionHandler(QuotaExceededException.class)
    public ResponseEntity<Map<String, Object>> handleQuotaExceeded(QuotaExceededException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error",       "QUOTA_EXCEEDED",
                        "resource",    ex.getResource(),
                        "current",     ex.getCurrent(),
                        "limit",       ex.getLimit(),
                        "plan",        ex.getPlan().name(),
                        "message",     ex.getMessage(),
                        "upgradeUrl",  "/pricing"
                ));
    }
}