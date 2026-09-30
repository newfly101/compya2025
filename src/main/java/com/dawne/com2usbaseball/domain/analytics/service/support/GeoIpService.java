package com.dawne.com2usbaseball.domain.analytics.service.support;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.CityResponse;
import com.maxmind.geoip2.record.AbstractNamedRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.util.List;

/**
 * MaxMind GeoLite2 City DB(.mmdb)로 IP → country/city 를 조회한다. 시작 시 1회 로드하고,
 * 파일이 없거나 손상됐으면 이후 모든 조회를 조용히 빈 결과로 흡수한다(예외 던지지 않음) —
 * 계정/라이선스 키/DB 파일 배치는 사용자 작업, 이 서비스는 파일 유무만 본다.
 */
@Service
@Slf4j
public class GeoIpService {

    private final DatabaseReader reader;

    public GeoIpService(@Value("${geoip.database.path:}") String databasePath) {
        this.reader = loadReader(databasePath);
    }

    private DatabaseReader loadReader(String databasePath) {
        if (databasePath == null || databasePath.isBlank()) {
            log.info("[ANALYTICS] geoip.database.path 미설정 — country/city 수집 스킵");
            return null;
        }
        File file = new File(databasePath);
        if (!file.exists()) {
            log.warn("[ANALYTICS] GeoIP DB 파일 없음({}) — country/city 수집 스킵", databasePath);
            return null;
        }
        try {
            return new DatabaseReader.Builder(file).build();
        } catch (IOException e) {
            log.error("[ANALYTICS] GeoIP DB 로드 실패({}): {}", databasePath, e.getMessage(), e);
            return null;
        }
    }

    /** 조회 실패(DB 미로드·IP 파싱 실패·조회 실패)는 예외 없이 빈 결과로 흡수한다. */
    public GeoLookupResult lookup(String ip) {
        if (reader == null || ip == null || ip.isBlank()) {
            return GeoLookupResult.EMPTY;
        }
        try {
            CityResponse response = reader.city(InetAddress.getByName(ip));
            String country = response.getCountry() != null ? response.getCountry().getIsoCode() : null;
            List<String> subdivisionNames = response.getSubdivisions().stream()
                    .map(GeoIpService::preferredName)
                    .filter(name -> name != null)
                    .toList();
            String cityName = preferredName(response.getCity());
            String city = regionLabel(subdivisionNames, cityName);
            return new GeoLookupResult(country, city);
        } catch (IOException | GeoIp2Exception e) {
            log.debug("[ANALYTICS] GeoIP 조회 실패(ip={}): {}", ip, e.getMessage());
            return GeoLookupResult.EMPTY;
        }
    }

    /** names.get("ko") 우선, 없으면 조회 시 설정한 locale(en) 순으로 english 등 대체 이름. */
    private static String preferredName(AbstractNamedRecord record) {
        if (record == null) {
            return null;
        }
        String korean = record.getNames() != null ? record.getNames().get("ko") : null;
        return korean != null ? korean : record.getName();
    }

    /**
     * 시·구 단위 지역 라벨. subdivisions 는 상위→하위 순(예: [경기도, 수원시]).
     * 도(道)/특별자치도는 생략하고, 광역시/특별시/특별자치시는 접미사를 뗀 시 이름만 쓴다.
     * subdivision 2단(도+시) 이면 하위(시)를 쓰고 상위(도)는 버린다. 표는 backend-developer brief 참고.
     */
    static String regionLabel(List<String> subdivisionNames, String cityName) {
        if (subdivisionNames == null || subdivisionNames.isEmpty()) {
            // 해외 등 subdivision 정보가 없으면 city 이름을 그대로 쓴다. 둘 다 없으면 null(country 만 저장).
            return cityName;
        }
        if (subdivisionNames.size() >= 2) {
            String lowerSubdivision = subdivisionNames.get(subdivisionNames.size() - 1);
            return cityName != null ? lowerSubdivision + " " + cityName : lowerSubdivision;
        }
        String metroName = stripMetroSuffix(subdivisionNames.get(0));
        if (metroName != null) {
            return cityName != null ? metroName + " " + cityName : metroName;
        }
        // 도/특별자치도 단일 레벨 — 도 이름은 생략하고 city 만 쓴다.
        return cityName;
    }

    private static final List<String> METRO_SUFFIXES = List.of("특별자치시", "광역시", "특별시");

    /** 광역시/특별시/특별자치시 접미사를 떼어낸다. 도/특별자치도는 대상이 아니라 null. */
    private static String stripMetroSuffix(String subdivisionName) {
        for (String suffix : METRO_SUFFIXES) {
            if (subdivisionName.endsWith(suffix)) {
                return subdivisionName.substring(0, subdivisionName.length() - suffix.length());
            }
        }
        return null;
    }

    public record GeoLookupResult(String country, String city) {
        public static final GeoLookupResult EMPTY = new GeoLookupResult(null, null);
    }
}
