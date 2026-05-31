package com.dawne.com2usbaseball.config;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.config.filter.AccessLogFilter;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.dawne.com2usbaseball.security.filter.JwtAuthFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import java.io.IOException;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AccessLogFilter accessLogFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final ObjectMapper objectMapper;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(new CustomAuthenticationEntryPoint(objectMapper)) // 401
                        .accessDeniedHandler(new CustomAccessDeniedHandler(objectMapper))           // 403
                )
                .authorizeHttpRequests(auth -> auth
                        // Swagger
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/docs/**",
                                "/swagger-custom.css"
                        ).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/wiki/**").permitAll()
                        .requestMatchers("/api/**").permitAll()
                        .anyRequest().denyAll()
                )
                .addFilterBefore(
                        accessLogFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .addFilterAfter(
                        jwtAuthFilter,
                        AccessLogFilter.class
                )
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable);

        return http.build();
    }

    // SecurityConfig.java - 401/403 핸들러 부분만

    @RequiredArgsConstructor
    public static class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

        private final ObjectMapper objectMapper;

        @Override
        public void commence(HttpServletRequest request,
                             HttpServletResponse response,
                             AuthenticationException authException) throws IOException {

            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            GlobalResponse<Void> body = GlobalResponse.fail(AuthMessages.AUTH_UNAUTHORIZED);
            objectMapper.writeValue(response.getWriter(), body);
        }
    }

    @RequiredArgsConstructor
    public static class CustomAccessDeniedHandler implements AccessDeniedHandler {

        private final ObjectMapper objectMapper;

        @Override
        public void handle(HttpServletRequest request,
                           HttpServletResponse response,
                           AccessDeniedException accessDeniedException) throws IOException {

            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            GlobalResponse<Void> body = GlobalResponse.fail(AuthMessages.AUTH_USER_BLOCKED);
            objectMapper.writeValue(response.getWriter(), body);
        }
    }
}
