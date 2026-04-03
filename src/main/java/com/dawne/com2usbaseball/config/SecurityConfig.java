package com.dawne.com2usbaseball.config;

import com.dawne.com2usbaseball.config.filter.AccessLogFilter;
import com.dawne.com2usbaseball.security.filter.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AccessLogFilter accessLogFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors->{})
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/docs/**",
                                "/static/swagger-custom.css"
                        ).permitAll()
                        .requestMatchers("/api/admin/**").authenticated()
                        .requestMatchers("/api/community/admin/**").authenticated()
                        .requestMatchers("/api/events/**").authenticated()
                        .requestMatchers("/api/**").permitAll()   // ← 구체적인 것들 다음에
                        .anyRequest().denyAll())
                // ✅ AccessLogFilter 먼저
                .addFilterBefore(
                        accessLogFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class
                )
                // ✅ JWT는 AccessLog 뒤
                .addFilterAfter(
                        jwtAuthFilter,
                        AccessLogFilter.class
                )
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable);

        return http.build();
    }

}
