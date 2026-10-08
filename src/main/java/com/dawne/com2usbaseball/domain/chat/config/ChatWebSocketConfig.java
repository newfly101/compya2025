package com.dawne.com2usbaseball.domain.chat.config;

import com.dawne.com2usbaseball.config.CorsConfig;
import com.dawne.com2usbaseball.security.cookie.AuthCookieFactory;
import com.dawne.com2usbaseball.security.provider.JwtProvider;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;

/**
 * STOMP /ws. 인증은 핸드셰이크의 ACCESS_TOKEN HttpOnly 쿠키(브라우저 JS 는 토큰을 못 읽는다).
 * 쿠키가 없거나 무효면 익명(구독만).
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class ChatWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final String TOKEN_ATTR = "chatToken";

    private final JwtProvider jwtProvider;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(CorsConfig.ALLOWED_ORIGINS.toArray(String[]::new))
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest req, ServerHttpResponse res,
                                                   WebSocketHandler h, Map<String, Object> attrs) {
                        if (req instanceof ServletServerHttpRequest s && s.getServletRequest().getCookies() != null) {
                            for (Cookie c : s.getServletRequest().getCookies()) {
                                if (AuthCookieFactory.ACCESS_TOKEN.equals(c.getName())) {
                                    attrs.put(TOKEN_ATTR, c.getValue());
                                }
                            }
                        }
                        return true;
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest req, ServerHttpResponse res, WebSocketHandler h, Exception ex) {
                    }
                });
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (acc != null && StompCommand.CONNECT.equals(acc.getCommand())) {
                    String token = resolveToken(acc);
                    if (token != null) {
                        try {
                            Long userId = jwtProvider.getUserId(token);
                            String role = jwtProvider.getUserRole(token);
                            acc.setUser(new UsernamePasswordAuthenticationToken(
                                    userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + role))));
                        } catch (Exception e) {
                            log.debug("chat: 무효 토큰 — 익명으로 연결");
                        }
                    }
                }
                return message;
            }
        });
    }

    private String resolveToken(StompHeaderAccessor acc) {
        Map<String, Object> attrs = acc.getSessionAttributes();
        return attrs == null ? null : (String) attrs.get(TOKEN_ATTR);
    }
}
