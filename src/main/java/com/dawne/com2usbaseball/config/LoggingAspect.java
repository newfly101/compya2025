package com.dawne.com2usbaseball.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Order(1)
@Slf4j
public class LoggingAspect {
    // @Service 어노테이션이 붙은 클래스 전부
    @Pointcut(
            "within(@org.springframework.stereotype.Service *)"
                    + " || within(@org.springframework.stereotype.Repository *)"
                    + " || within(@org.springframework.stereotype.Controller *)"
                    + " || within(@org.springframework.web.bind.annotation.RestController *)"
    )
    public void applicationLayer() {}

    @Pointcut("@within(org.apache.ibatis.annotations.Mapper)")
    public void mapperBean() {}

    @Pointcut("within(org.mybatis.spring.mapper.MapperFactoryBean+)")
    public void mapperFactoryBean() {}


//    @Pointcut("within(org.springdoc..*)")
//    public void swaggerBean() {
//    }

    /** 둘 다 합친 포인트컷 */
//    @Pointcut("(applicationLayer() || mapperBean()) && !mapperFactoryBean() && !swaggerBean()")
    @Pointcut("(applicationLayer() || mapperBean()) && !mapperFactoryBean()")
    public void applicationAndMappers() {}

    @Around("applicationAndMappers()")
    public Object logAroundService(ProceedingJoinPoint point) throws Throwable {
        String className  = point.getSignature().getDeclaringType().getSimpleName();
        String methodName = point.getSignature().getName();

        if (point.getArgs() != null && point.getArgs().length > 0) {
            log.info("(START) [{}] {} data={}", className, methodName, point.getArgs());
        } else {
            log.info("(START) [{}] {}", className, methodName);
        }

        // 3) 메서드 정보 조회
        long start = System.currentTimeMillis();
        try {
            Object result = point.proceed();
            long elapsed = System.currentTimeMillis() - start;
            MethodSignature sig = (MethodSignature) point.getSignature();
            boolean isVoid = sig.getReturnType().equals(Void.TYPE);


            // 4) void 여부에 따라 로깅 분기
            if (isVoid) {
                log.info("(EXIT) [{}] {} 완료 ({}ms)", className, methodName, elapsed);
            } else {
                log.info("(EXIT) [{}] {} 완료 return={} ({}ms)", className, methodName, result, elapsed);
            }
            return result;
        } catch (Throwable t) {
            log.error("(ERROR) [{}] {} 예외={}", className, methodName, t.toString());
            throw t;
        }
    }
}
