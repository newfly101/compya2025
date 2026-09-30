package com.dawne.com2usbaseball.domain.analytics.service.support;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.CityResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;

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
            String city = response.getCity() != null ? response.getCity().getName() : null;
            return new GeoLookupResult(country, city);
        } catch (IOException | GeoIp2Exception e) {
            log.debug("[ANALYTICS] GeoIP 조회 실패(ip={}): {}", ip, e.getMessage());
            return GeoLookupResult.EMPTY;
        }
    }

    public record GeoLookupResult(String country, String city) {
        public static final GeoLookupResult EMPTY = new GeoLookupResult(null, null);
    }
}
