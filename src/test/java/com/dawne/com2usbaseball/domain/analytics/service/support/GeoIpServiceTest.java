package com.dawne.com2usbaseball.domain.analytics.service.support;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GeoIP 조회 — DB 파일 미배치 시 흡수 · 지역 라벨 규칙")
class GeoIpServiceTest {

    @Test
    @DisplayName("DB 경로가 비어 있으면 조회는 항상 빈 결과를 반환한다")
    void 경로_미설정시_빈결과() {
        GeoIpService service = new GeoIpService("");
        assertThat(service.lookup("8.8.8.8")).isEqualTo(GeoIpService.GeoLookupResult.EMPTY);
    }

    @Test
    @DisplayName("DB 파일이 존재하지 않으면 조회는 항상 빈 결과를 반환한다")
    void 파일_없으면_빈결과() {
        GeoIpService service = new GeoIpService("/no/such/path/GeoLite2-City.mmdb");
        assertThat(service.lookup("8.8.8.8")).isEqualTo(GeoIpService.GeoLookupResult.EMPTY);
    }

    @Test
    @DisplayName("광역시 + 구 → 광역시 접미사를 떼고 구와 합친다")
    void 광역시_플러스_구() {
        assertThat(GeoIpService.regionLabel(List.of("대구광역시"), "달서구")).isEqualTo("대구 달서구");
    }

    @Test
    @DisplayName("도 + 시(하위 subdivision) + 구 → 도는 생략하고 시와 구만 합친다")
    void 도_시_구() {
        assertThat(GeoIpService.regionLabel(List.of("경기도", "수원시"), "팔달구")).isEqualTo("수원시 팔달구");
    }

    @Test
    @DisplayName("도 + 시(city, 하위 subdivision 없음) → 도는 생략하고 시만 남긴다")
    void 도_플러스_시만() {
        assertThat(GeoIpService.regionLabel(List.of("경기도"), "천안시")).isEqualTo("천안시");
    }

    @Test
    @DisplayName("광역시만 있고 city 없음 → 접미사만 뗀다")
    void 광역시만_city없음() {
        assertThat(GeoIpService.regionLabel(List.of("대구광역시"), null)).isEqualTo("대구");
    }

    @Test
    @DisplayName("city 도 subdivision 도 없음 → null(country 만 저장)")
    void 둘다없음() {
        assertThat(GeoIpService.regionLabel(List.of(), null)).isNull();
    }

    @Test
    @DisplayName("해외(subdivision 없음, city 만 있음) → city 이름 그대로")
    void 해외_city만() {
        assertThat(GeoIpService.regionLabel(List.of(), "Tokyo")).isEqualTo("Tokyo");
    }
}
