package com.dawne.com2usbaseball.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.lang.reflect.Method;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 행동 이벤트 수집처럼 "요청 스레드를 절대 막으면 안 되는" 비동기 작업 전용 풀.
 * 작게 유지한다(2~4) — 이 풀이 본 API 요청 스레드/DB 커넥션 풀을 잠식하면 안 되기 때문.
 *
 * 풀이 꽉 차면 CallerRunsPolicy 대신 DiscardPolicy 를 쓴다 — CallerRunsPolicy 는 제출한
 * 스레드(=요청 스레드)가 대신 실행하게 만들어 결국 사용자 요청을 막아버린다. 통계 수집이
 * 밀렸다고 사용자 화면이 느려지면 본말전도이므로, 밀리면 그냥 버린다.
 */
@Configuration
@EnableAsync
@Slf4j
public class AsyncConfig implements AsyncConfigurer {

    @Override
    @Bean(name = "analyticsEventExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("analytics-event-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardPolicy());
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (Throwable ex, Method method, Object... params) ->
                log.error("[ANALYTICS] 비동기 이벤트 처리 중 예외 (method={}): {}", method.getName(), ex.getMessage(), ex);
    }
}
