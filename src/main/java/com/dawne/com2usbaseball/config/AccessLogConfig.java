package com.dawne.com2usbaseball.config;

import com.dawne.com2usbaseball.config.filter.AccessLogFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AccessLogConfig {

    @Bean
    public FilterRegistrationBean<AccessLogFilter> accessLogFilter() {
        FilterRegistrationBean<AccessLogFilter> bean =
                new FilterRegistrationBean<>();

        bean.setFilter(new AccessLogFilter());
        bean.setOrder(1);
        bean.addUrlPatterns("/*");

        return bean;
    }


}
