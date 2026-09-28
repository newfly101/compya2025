package com.dawne.com2usbaseball.config.filter;

import com.dawne.com2usbaseball.common.util.ClientInfoExtractor;
import io.micrometer.common.lang.NonNull;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
@Slf4j
public class AccessLogFilter extends OncePerRequestFilter {

    private static final String MASK = "***";
    private static final int QUERY_MAX_LENGTH = 300;

    /** 쿼리스트링에 값이 실리면 안 되는 키 (OAuth code/state, 토큰류). LoggingAspect 의 마스킹 기준과 같은 계열. */
    private static final Set<String> SENSITIVE_QUERY_KEYS = Set.of(
            "code", "state", "token", "access_token", "refresh_token",
            "password", "pwd", "secret", "jwt", "apikey", "authorization", "signature"
    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String ip = ClientInfoExtractor.getClientIp(request);
        String country = ClientInfoExtractor.getCountry(request);
        String method = request.getMethod();
        String ua = ClientInfoExtractor.safe(request.getHeader("User-Agent"));
        String pageUrl = ClientInfoExtractor.safe(request.getHeader("X-Page-Url"));
        String path = request.getRequestURI() + maskQuery(request.getQueryString());

        long start = System.currentTimeMillis();
        try {
            filterChain.doFilter(request, response);
        } finally {
            // 로깅 실패가 요청 처리를 막지 않게 한다 (필터는 모든 요청이 지나는 지점).
            try {
                log.info("[ACCESS] {} {} status={} {}ms ip={} country={} ref=\"{}\" ua=\"{}\"",
                        method, path, response.getStatus(), System.currentTimeMillis() - start,
                        ip, country, pageUrl, ua);
            } catch (Exception ignored) {
                // 접근 로그는 실패해도 응답에 영향을 주지 않는다.
            }
        }
    }

    /** 쿼리스트링은 남기되 민감 키의 값만 가린다. 값 자체를 파싱/디코딩하지 않는다. */
    static String maskQuery(String queryString) {
        if (queryString == null || queryString.isBlank()) return "";
        StringBuilder sb = new StringBuilder(queryString.length() + 16).append('?');
        for (String pair : queryString.split("&")) {
            if (sb.length() > 1) sb.append('&');
            int eq = pair.indexOf('=');
            String key = (eq < 0) ? pair : pair.substring(0, eq);
            if (eq >= 0 && SENSITIVE_QUERY_KEYS.contains(key.toLowerCase())) {
                sb.append(key).append('=').append(MASK);
            } else {
                sb.append(pair);
            }
        }
        String masked = sb.toString();
        if (masked.length() > QUERY_MAX_LENGTH) {
            masked = masked.substring(0, QUERY_MAX_LENGTH) + "...";
        }
        return ClientInfoExtractor.safe(masked);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.startsWith("/swagger")
                || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/favicon")
                || uri.startsWith("/docs/")
                || uri.startsWith("/actuator/")
                || uri.equals("/error");
    }

    /** 에러 dispatch(/error) 에서 doFilterInternal 이 한 번 더 돌아 같은 요청이 두 줄로 남는 것을 막는다. */
    @Override
    protected boolean shouldNotFilterErrorDispatch() {
        return true;
    }

    @PostConstruct
    public void init() {
        log.info("🔥 AccessLogFilter initialized");
    }
}
