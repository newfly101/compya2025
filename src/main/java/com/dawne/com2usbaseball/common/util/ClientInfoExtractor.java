package com.dawne.com2usbaseball.common.util;

import jakarta.servlet.http.HttpServletRequest;

public final class ClientInfoExtractor {
    public ClientInfoExtractor() {    }

    public static String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    public static String getCountry(HttpServletRequest request) {
        String country = request.getHeader("CloudFront-Viewer-Country");
        return (country == null || country.isBlank()) ? "-" : country;
    }

    public static String safe(String value) {
        if (value == null || value.isBlank()) return "-";
        return value.replaceAll("[\\r\\n\\t]", " ").trim();
    }
}
