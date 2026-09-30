package com.dawne.com2usbaseball.domain.analytics.service.support;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GeoIP 조회 — DB 파일 미배치 시 흡수")
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
}
