package com.dawne.com2usbaseball.config.filter;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Set;

/**
 * CSRF 완화: /api/** 상태 변경 요청의 Origin(없으면 Referer)이 허용 출처가 아니면 403.
 * 둘 다 없으면(서버간 호출 등 비브라우저) 통과.
 */
@RequiredArgsConstructor
public class OriginCheckFilter extends OncePerRequestFilter {

    private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS", "TRACE");

    private final List<String> allowedOrigins;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String origin = requestOrigin(request);
        if (SAFE_METHODS.contains(request.getMethod())
                || !request.getRequestURI().startsWith("/api/")
                || origin == null
                || allowedOrigins.contains(origin)) {
            chain.doFilter(request, response);
            return;
        }
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), GlobalResponse.fail(AuthMessages.AUTH_FORBIDDEN));
    }

    private static String requestOrigin(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        if (origin != null) return origin;
        String referer = request.getHeader("Referer");
        if (referer == null) return null;
        try {
            URI u = URI.create(referer);
            if (u.getScheme() == null || u.getHost() == null) return "invalid";
            return u.getScheme() + "://" + u.getHost() + (u.getPort() == -1 ? "" : ":" + u.getPort());
        } catch (IllegalArgumentException e) {
            return "invalid";
        }
    }
}
