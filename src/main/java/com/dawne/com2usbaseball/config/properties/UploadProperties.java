package com.dawne.com2usbaseball.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "upload.image")
public class UploadProperties {

    /** 이미지 업로드 허용 최대 용량 (bytes). 기본 5MB */
    private long maxSizeBytes = 5L * 1024 * 1024;
}
