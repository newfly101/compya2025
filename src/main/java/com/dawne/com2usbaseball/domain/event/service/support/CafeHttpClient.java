package com.dawne.com2usbaseball.domain.event.service.support;

import com.dawne.com2usbaseball.config.properties.CafeSyncProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** 카페 내부 API 호출 — 로그인 없이, 브라우저 UA + Referer 만 보낸다. 주소는 공개 약속이 아니라 바뀔 수 있다. */
@Slf4j
@Component
public class CafeHttpClient implements CafeClient {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final int MAX_IMAGE_BYTES = 5 * 1024 * 1024;

    private final CafeSyncProperties props;
    private final ObjectMapper objectMapper;
    private final RestClient rest;

    public CafeHttpClient(CafeSyncProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(15_000);
        this.rest = RestClient.builder().requestFactory(factory).build();
    }

    @Override
    public List<CafeArticleSummary> fetchList() {
        String url = "https://apis.naver.com/cafe-web/cafe-boardlist-api/v1/cafes/" + props.getCafeId()
                + "/menus/" + props.getMenuId() + "/articles?page=1&pageSize=" + props.getListPageSize()
                + "&sortBy=TIME&viewType=L";
        JsonNode root = getJson(url, "https://cafe.naver.com/" + props.getCafeUrl());
        List<CafeArticleSummary> out = new ArrayList<>();
        collectSummaries(root, out);
        return out;
    }

    // 응답 모양이 바뀌어도 견디도록 트리를 훑어 articleId + subject 가 함께 있는 객체를 목록으로 본다
    private void collectSummaries(JsonNode node, List<CafeArticleSummary> out) {
        if (node.isObject()) {
            if (node.hasNonNull("articleId") && node.hasNonNull("subject")) {
                long id = node.get("articleId").asLong();
                if (out.stream().noneMatch(s -> s.articleId() == id)) {
                    JsonNode writer = node.path("writerInfo");
                    String key = node.hasNonNull("memberKey") ? node.get("memberKey").asText() : writer.path("memberKey").asText(null);
                    out.add(new CafeArticleSummary(id, node.get("subject").asText(), key, toKst(node.path("writeDateTimestamp"))));
                }
            }
            node.elements().forEachRemaining(c -> collectSummaries(c, out));
        } else if (node.isArray()) {
            node.elements().forEachRemaining(c -> collectSummaries(c, out));
        }
    }

    @Override
    public CafeArticle fetchArticle(long articleId) {
        String url = "https://apis.naver.com/cafe-web/cafe-articleapi/v2.1/cafes/" + props.getCafeId()
                + "/articles/" + articleId + "?useCafeId=true";
        JsonNode root = getJson(url, "https://cafe.naver.com/" + props.getCafeUrl() + "/" + articleId);
        JsonNode art = findWithKey(root, "contentHtml");
        if (art == null) throw new IllegalStateException("본문 필드 없음 articleId=" + articleId);
        JsonNode writer = art.path("writer");
        return new CafeArticle(articleId, art.path("subject").asText(""), writer.path("memberKey").asText(null),
                toKst(art.path("writeDate")), art.path("contentHtml").asText(null));
    }

    private JsonNode findWithKey(JsonNode node, String key) {
        if (node.isObject()) {
            if (node.has(key)) return node;
            for (JsonNode c : node) {
                JsonNode r = findWithKey(c, key);
                if (r != null) return r;
            }
        } else if (node.isArray()) {
            for (JsonNode c : node) {
                JsonNode r = findWithKey(c, key);
                if (r != null) return r;
            }
        }
        return null;
    }

    @Override
    public Optional<byte[]> fetchImage(String url) {
        try {
            URI uri = URI.create(url);
            String host = uri.getHost();
            // 재업로드 대상은 네이버 이미지 서버만 — 임의 주소를 서버가 대신 받아오지 않게 막는다 (SSRF)
            if (!"https".equalsIgnoreCase(uri.getScheme()) || host == null || !isAllowedImageHost(host)) {
                log.warn("[CAFE-SYNC] 허용하지 않는 이미지 주소: {}", url);
                return Optional.empty();
            }
            byte[] body = rest.get().uri(uri)
                    .header("User-Agent", props.getUserAgent())
                    .header("Referer", "https://cafe.naver.com/")
                    .retrieve().body(byte[].class);
            if (body == null || body.length == 0 || body.length > MAX_IMAGE_BYTES) return Optional.empty();
            return Optional.of(body);
        } catch (Exception e) {
            log.warn("[CAFE-SYNC] 이미지 받기 실패 url={}: {}", url, e.getMessage());
            return Optional.empty();
        }
    }

    static boolean isAllowedImageHost(String host) {
        String h = host.toLowerCase();
        return h.endsWith(".pstatic.net") || h.endsWith(".naver.net") || h.endsWith(".naver.com");
    }

    private JsonNode getJson(String url, String referer) {
        String body = rest.get().uri(URI.create(url))
                .header("User-Agent", props.getUserAgent())
                .header("Accept", "application/json, text/plain, */*")
                .header("Referer", referer)
                .retrieve().body(String.class);
        try {
            return objectMapper.readTree(body);
        } catch (Exception e) {
            throw new IllegalStateException("카페 응답이 JSON 이 아님", e);
        }
    }

    private static LocalDateTime toKst(JsonNode n) {
        if (n == null || n.isMissingNode() || n.isNull() || !n.canConvertToLong() || n.asLong() <= 0) return null;
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(n.asLong()), KST);
    }
}
