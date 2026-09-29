package com.dawne.com2usbaseball.domain.event.service.support;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/** 네트워크 없이 fixtures(실제 카페 본문·쿠폰 표 구조)로 파서를 검증한다. */
class CafeArticleParserTest {

    private static final LocalDateTime WRITTEN = LocalDateTime.of(2026, 9, 24, 10, 30);

    private static String fixture(String name) throws IOException {
        try (var in = CafeArticleParserTest.class.getResourceAsStream("/cafe/" + name)) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    @DisplayName("제목 - 이벤트 머리말·마감 괄호·이벤트 단어를 떼고 마감은 23:59:59")
    void 제목_해석_시각없음() {
        CafeTitle t = CafeArticleParser.parseTitle("[이벤트] 추석 연휴 접속 보상 이벤트 (~9/26 23:59)", WRITTEN);
        assertThat(t.name()).isEqualTo("추석 연휴 접속 보상");
        assertThat(t.expireAt()).isEqualTo(LocalDateTime.of(2026, 9, 26, 23, 59, 0));

        CafeTitle noTime = CafeArticleParser.parseTitle("[이벤트] 에픽 선수 승급 이벤트(~2027/2/28)", WRITTEN);
        assertThat(noTime.name()).isEqualTo("에픽 선수 승급");
        assertThat(noTime.expireAt()).isEqualTo(LocalDateTime.of(2027, 2, 28, 23, 59, 59));
    }

    @Test
    @DisplayName("제목 - 괄호가 둘이면 첫 번째 날짜 괄호를 쓴다")
    void 제목_괄호_둘() {
        CafeTitle t = CafeArticleParser.parseTitle("[이벤트] 포스트시즌 트로피 제작 이벤트 (~11/8 23:59)(21:55 보상 지급 완료)", WRITTEN);
        assertThat(t.name()).isEqualTo("포스트시즌 트로피 제작");
        assertThat(t.expireAt()).isEqualTo(LocalDateTime.of(2026, 11, 8, 23, 59, 0));
    }

    @Test
    @DisplayName("제목 - 12월 글의 연도 없는 1월 마감은 다음 해로 본다")
    void 제목_연도_넘김() {
        CafeTitle t = CafeArticleParser.parseTitle("[이벤트] 연말 이벤트 (~1/5 23:59)", LocalDateTime.of(2026, 12, 20, 10, 0));
        assertThat(t.expireAt()).isEqualTo(LocalDateTime.of(2027, 1, 5, 23, 59, 0));
    }

    @Test
    @DisplayName("제목 - 마감 괄호가 없으면 마감은 없다")
    void 제목_마감없음() {
        CafeTitle t = CafeArticleParser.parseTitle("[이벤트] 업데이트 이후~ 접속 이벤트", WRITTEN);
        assertThat(t.expireAt()).isNull();
    }

    @Test
    @DisplayName("이벤트 글 분류 - 모아보기와 이벤트 머리말 없는 글은 제외")
    void 분류() {
        assertThat(CafeArticleParser.isEventSubject("[이벤트] 무언가 (~9/30)")).isTrue();
        assertThat(CafeArticleParser.isEventSubject("[이벤트] 2026 포스트시즌 이벤트 모아보기")).isFalse();
        assertThat(CafeArticleParser.isEventSubject("[공지] 점검 안내")).isFalse();
    }

    @Test
    @DisplayName("본문 - 이벤트 기간 문단부터 감사합니다 직전까지 다시 쓴다")
    void 본문_구간_추출() throws IOException {
        CafeBody body = CafeArticleParser.extractBody(fixture("event-2016389-roundup.contentHtml.html"), WRITTEN);

        assertThat(body.found()).isTrue();
        assertThat(body.html()).contains("<p>");
        assertThat(body.html()).doesNotContain("class=", "style=", "<script", "se-component");
        assertThat(body.periodText().replaceAll("\\s", "")).contains("이벤트기간");
        assertThat(body.html().replaceAll("\\s", "")).doesNotContain("감사합니다");
        assertThat(body.bannerImage()).startsWith("http");
    }

    @Test
    @DisplayName("본문 - 이벤트 기간 문구가 없으면 구간 못 찾음")
    void 본문_구간_없음() {
        String html = "<div class=\"se-component se-text\"><div class=\"se-component-content\">"
                + "<p class=\"se-text-paragraph\">쿠폰 안내입니다</p></div></div>";
        assertThat(CafeArticleParser.extractBody(html, WRITTEN).found()).isFalse();
        assertThat(CafeArticleParser.extractBody(null, WRITTEN).found()).isFalse();
    }

    @Test
    @DisplayName("본문 - 표의 병합 칸(rowspan·colspan)을 유지한다 (보름달 이벤트 보상표)")
    void 본문_표_병합칸() {
        String cell = "<td class=\"se-cell\" %s><div class=\"se-module se-module-text\"><p class=\"se-text-paragraph\">%s</p></div></td>";
        String html = "<div class=\"se-component se-text\"><div class=\"se-component-content\">"
                + "<p class=\"se-text-paragraph\">이벤트 기간: 9/21 ~ 10/18</p></div></div>"
                + "<div class=\"se-component se-table\"><div class=\"se-component-content\"><table class=\"se-table-content\"><tbody>"
                + "<tr class=\"se-tr\">" + cell.formatted("rowspan=\"3\"", "30개") + cell.formatted("", "고급 골드팩")
                + cell.formatted("", "3") + cell.formatted("rowspan=\"3\"", "3종 택 1") + "</tr>"
                + "<tr class=\"se-tr\">" + cell.formatted("", "고급 코치팩") + cell.formatted("", "3") + "</tr>"
                + "<tr class=\"se-tr\">" + cell.formatted("colspan=\"2\"", "하급 등급 상승권 1") + "</tr>"
                + "</tbody></table></div></div>"
                + "<div class=\"se-component se-text\"><div class=\"se-component-content\">"
                + "<p class=\"se-text-paragraph\">감사합니다.</p></div></div>";
        String body = CafeArticleParser.extractBody(html, WRITTEN).html();
        assertThat(body).contains("<td rowspan=\"3\">30개</td>", "<td rowspan=\"3\">3종 택 1</td>",
                "<td colspan=\"2\">하급 등급 상승권 1</td>", "<td>고급 코치팩</td>");
    }

    @Test
    @DisplayName("본문 - 정제 후 허용하지 않는 태그·속성은 사라진다")
    void 정제() {
        String dirty = "<p onclick=\"x()\">안녕<script>alert(1)</script></p><img src=\"javascript:alert(1)\"><iframe src=\"https://a\"></iframe>";
        String clean = CafeArticleParser.sanitize(dirty);
        assertThat(clean).doesNotContain("onclick", "<script", "javascript:", "iframe");
        assertThat(clean).contains("안녕");
    }

    @Test
    @DisplayName("해시 - 이미지 주소가 카페에서 S3 로 바뀌어도 같은 본문이면 같은 해시")
    void 해시_이미지주소_무관() {
        String raw = "<p>기간</p>\n<img src=\"https://cafeptthumb.pstatic.net/a.png\" loading=\"lazy\" alt=\"\">";
        String s3 = CafeArticleParser.rewriteImages(raw, Map.of("https://cafeptthumb.pstatic.net/a.png", "https://s3.example/events/1/a.png"));
        assertThat(s3).contains("https://s3.example/events/1/a.png");
        assertThat(CafeArticleParser.contentHash(s3)).isEqualTo(CafeArticleParser.contentHash(raw));
        assertThat(CafeArticleParser.contentHash("<p>기간2</p>")).isNotEqualTo(CafeArticleParser.contentHash("<p>기간</p>"));
    }

    @Test
    @DisplayName("본문 - 업로드에 실패한 이미지는 뺀다")
    void 이미지_업로드_실패() {
        String html = "<p>a</p><img src=\"https://x.pstatic.net/a.png\" alt=\"\">";
        assertThat(CafeArticleParser.rewriteImages(html, Map.of())).doesNotContain("<img");
    }

    @Test
    @DisplayName("쿠폰 표 - 발행된 행은 등록 대상, 미발행(공개 예정) 행은 대상 아님")
    void 쿠폰_표() throws IOException {
        LocalDateTime today = LocalDateTime.of(2026, 9, 25, 10, 0);
        List<CafeCouponRow> rows = CafeArticleParser.extractCoupons(fixture("coupon-table-synthetic.html"), today);

        assertThat(rows).hasSize(2);
        CafeCouponRow issued = rows.get(0);
        assertThat(issued.couponCode()).isEqualTo("RECORD178HD");
        assertThat(issued.title()).isEqualTo("김진성 선수 KBO 최다 홀드 달성 쿠폰");
        assertThat(issued.detail()).isEqualTo("한계돌파권 x1\n잠재력 설정권 x1");
        assertThat(issued.expireAt()).isEqualTo(LocalDateTime.of(2026, 9, 30, 23, 59, 59));
        assertThat(issued.registrable(today)).isTrue();

        CafeCouponRow pending = rows.get(1);
        assertThat(pending.pending()).isTrue();
        assertThat(pending.registrable(today)).isFalse();
    }

    @Test
    @DisplayName("쿠폰 표 - 기한이 지난 행은 등록하지 않는다")
    void 쿠폰_기한지남() throws IOException {
        LocalDateTime later = LocalDateTime.of(2026, 10, 2, 10, 0);
        List<CafeCouponRow> rows = CafeArticleParser.extractCoupons(fixture("coupon-table-synthetic.html"), later);
        assertThat(rows.get(0).registrable(later)).isFalse();
    }

    @Test
    @DisplayName("쿠폰 표 - 이벤트 보상표(쿠폰 번호 칸 없음)는 쿠폰으로 오인하지 않는다")
    void 쿠폰_오인_방지() throws IOException {
        List<CafeCouponRow> rows = CafeArticleParser.extractCoupons(
                fixture("event-2016389-roundup.contentHtml.html"), LocalDateTime.of(2026, 9, 25, 10, 0));
        assertThat(rows).isEmpty();
    }

    @Test
    @DisplayName("이미지 허용 도메인 - 네이버 이미지 서버만")
    void 이미지_도메인() {
        assertThat(CafeHttpClient.isAllowedImageHost("cafeptthumb-phinf.pstatic.net")).isTrue();
        assertThat(CafeHttpClient.isAllowedImageHost("evil.example.com")).isFalse();
        assertThat(CafeHttpClient.isAllowedImageHost("pstatic.net.evil.com")).isFalse();
    }
}
