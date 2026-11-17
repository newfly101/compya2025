package com.dawne.com2usbaseball.config.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OriginCheckFilterTest {

    private final OriginCheckFilter filter =
            new OriginCheckFilter(List.of("https://compyafun.com"), new ObjectMapper());

    private int run(String method, String uri, String origin, String referer) throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest(method, uri);
        req.setRequestURI(uri);
        if (origin != null) req.addHeader("Origin", origin);
        if (referer != null) req.addHeader("Referer", referer);
        MockHttpServletResponse res = new MockHttpServletResponse();
        filter.doFilter(req, res, new MockFilterChain());
        return res.getStatus();
    }

    @Test
    @DisplayName("허용 출처 POST 는 통과")
    void 허용출처_통과() throws Exception {
        assertEquals(200, run("POST", "/api/auth/logout", "https://compyafun.com", null));
    }

    @Test
    @DisplayName("타 출처 POST 는 403, Referer 만 있어도 판정")
    void 타출처_403() throws Exception {
        assertEquals(403, run("POST", "/api/auth/logout", "https://evil.com", null));
        assertEquals(403, run("DELETE", "/api/users/me", null, "https://evil.com/x"));
        assertEquals(200, run("POST", "/api/auth/logout", null, "https://compyafun.com/a?b=1"));
    }

    @Test
    @DisplayName("Origin·Referer 없으면 통과, GET 은 타 출처여도 통과")
    void 출처없음_GET_통과() throws Exception {
        assertEquals(200, run("POST", "/api/auth/refresh", null, null));
        assertEquals(200, run("GET", "/api/coupons", "https://evil.com", null));
    }
}
