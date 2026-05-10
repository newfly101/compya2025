package com.dawne.com2usbaseball.config.properties;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "cloud.aws")
public class S3Properties {

    private Credentials credentials;
    private Region region;
    private S3 s3;

    @PostConstruct
    void validate() {
        if (credentials == null || isBlank(credentials.getAccessKey()) || isBlank(credentials.getSecretKey())) {
            throw new IllegalStateException("cloud.aws.credentials.{access-key,secret-key} must be set");
        }
        if (region == null || isBlank(region.getStaticValue())) {
            throw new IllegalStateException("cloud.aws.region.static-value must be set");
        }
        if (s3 == null || isBlank(s3.getBucket()) || isBlank(s3.getUrl())) {
            throw new IllegalStateException("cloud.aws.s3.{bucket,url} must be set");
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    @Getter @Setter
    public static class Credentials {
        private String accessKey;
        private String secretKey;
    }

    @Getter @Setter
    public static class Region {
        private String staticValue;
    }

    @Getter @Setter
    public static class S3 {
        private String bucket;
        private String url;
    }
}
