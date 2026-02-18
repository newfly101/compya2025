package com.dawne.com2usbaseball.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "cloud.aws")
public class S3Properties {

    private Credentials credentials;
    private Region region;
    private S3 s3;

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
