package com.dawne.com2usbaseball.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.APIKEY)
                .in(SecurityScheme.In.COOKIE)
                .name("ACCESS_TOKEN");

        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("cookieAuth");

        return new OpenAPI()
                .info(apiInfo())
                // 운영 비공개 정책 — localhost 만 노출
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Server")
                ))
                .addSecurityItem(securityRequirement)
                .components(new Components()
                        .addSecuritySchemes("cookieAuth", securityScheme))
                .externalDocs(new ExternalDocumentation()
                        .description("Project API Docs"));
    }

    private Info apiInfo() {
        return new Info()
                .title("Com2us Baseball 2026 Fun API")
                .description("컴투스프로야구2026 컴프야펀 전용 API 문서")
                .version("v2.0.0")
                .contact(new Contact()
                        .name("김잿농")
                        .email("newfly101@naver.com"));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("public")
                .pathsToMatch("/api/**")
                .pathsToExclude("/api/admin/**", "/api/community/admin/**")
                .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("admin")
                .pathsToMatch("/api/admin/**", "/api/community/admin/**")
                .build();
    }
}
