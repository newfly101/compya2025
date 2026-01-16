package com.dawne.com2usbaseball.config;

import com.dawne.com2usbaseball.config.filter.AccessLogFilter;
import org.springframework.context.annotation.Bean;

public class AccessLogConfig {

    @Bean
    public AccessLogFilter accessLogFilter() {
        return new AccessLogFilter();
    }
}
