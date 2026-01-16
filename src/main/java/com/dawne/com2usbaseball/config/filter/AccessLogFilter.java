package com.dawne.com2usbaseball.config.filter;

import com.dawne.com2usbaseball.statistic.ClientInfoExtractor;
import io.micrometer.common.lang.NonNull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
public class AccessLogFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String ip = ClientInfoExtractor.getClientIp(request);
        String country = ClientInfoExtractor.getCountry(request);
        String method = request.getMethod();
        String ua = ClientInfoExtractor.safe(request.getHeader("User-Agent"));
        String pageUrl = ClientInfoExtractor.safe(
                request.getHeader("X-Page-Url")
        );

        /* 페이지 설정 구 버전 */
        String uri = request.getRequestURI();
        String referer = ClientInfoExtractor.safe(request.getHeader("Referer"));
        String pagePath = ClientInfoExtractor.safe(
                request.getHeader("X-Page-Path")
        );

        String refBase = referer.endsWith("/")
                ? referer.substring(0, referer.length() - 1)
                : referer;

        String fullRef = refBase + pagePath;

        try {
            filterChain.doFilter(request, response);
        } finally {
            log.info("[ACCESS] ref=\"{}\" ip={} country={}  method={}  ua=\"{}\"",
                    pageUrl, ip, country, method, ua);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.startsWith("/swagger")
                || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/favicon");
    }
}
